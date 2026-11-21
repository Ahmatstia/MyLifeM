import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { normalizeTaskStatus } from '@/shared/domain/task-status';
import { writeTaskStatus } from '@/shared/data/task-status';
import { userSettings, tasks, dailyFocusItems } from '@/db/schema';
import { formatLocalDate, isDateOnly } from '@/shared/utils/local-date';
import { MANAGED_TASKS_KEY, parseManagedTasks, validateManagedTask } from '../../domain/managed-task-validation';
import {
  BUILT_IN_ALARM_TRACKS,
  type CreateManagedTaskInput,
  type CustomAlarmTrack,
  type ManagedTaskEntity,
} from '../../domain/entities/managed-task.entity';
import { TaskAlarmNotificationService } from '../services/task-alarm-notification.service';

const CUSTOM_TRACKS_KEY = 'custom_alarm_tracks_v1';

type TaskConnection = Pick<typeof db, 'select' | 'insert' | 'update' | 'delete'>;

type AlarmListener = (ringingTask: ManagedTaskEntity | null) => void;
type DataListener = () => void;

let currentRingingTask: ManagedTaskEntity | null = null;
const alarmListeners = new Set<AlarmListener>();
const dataListeners = new Set<DataListener>();

function notifyAlarmListeners() {
  for (const fn of alarmListeners) {
    fn(currentRingingTask);
  }
}

function notifyDataListeners() {
  for (const fn of dataListeners) {
    fn();
  }
}

export function subscribeRingingAlarm(fn: AlarmListener): () => void {
  alarmListeners.add(fn);
  fn(currentRingingTask);
  return () => {
    alarmListeners.delete(fn);
  };
}

export function subscribeManagedTasksChange(fn: DataListener): () => void {
  dataListeners.add(fn);
  return () => {
    dataListeners.delete(fn);
  };
}

export function triggerAlarmNow(task: ManagedTaskEntity): void {
  currentRingingTask = task;
  notifyAlarmListeners();
}

export function clearRingingAlarm(): void {
  currentRingingTask = null;
  notifyAlarmListeners();
}

export class ManagedTaskRepository {
  private alarmUpdates: Promise<void> = Promise.resolve();

  private readTasks(connection: Pick<TaskConnection, 'select'>): ManagedTaskEntity[] {
    const row = connection.select().from(userSettings)
      .where(eq(userSettings.key, MANAGED_TASKS_KEY)).get();
    if (!row) return [];
    const parsed = parseManagedTasks(row.value);

    const coreMap = new Map(connection.select().from(tasks).all().map(task => [task.id, task]));
    return parsed.map((item: ManagedTaskEntity) => {
      const core = coreMap.get(item.id);
      if (!core) return item;
      const completed = normalizeTaskStatus(core.status) === 'COMPLETED';
      return {
        ...item,
        isCompleted: completed,
        completedAt: completed ? core.completedAt || item.completedAt : null,
      };
    });
  }

  async getAllTasks(): Promise<ManagedTaskEntity[]> {
    return this.readTasks(db).sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return (a.executionDate + 'T' + a.executionTime).localeCompare(b.executionDate + 'T' + b.executionTime);
    });
  }

  private mutateTasks(update: (current: ManagedTaskEntity[], tx: TaskConnection) => ManagedTaskEntity[]): ManagedTaskEntity[] {
    return db.transaction(tx => {
      const updated = update(this.readTasks(tx), tx);
      this.writeTasks(tx, updated);
      return updated;
    });
  }

  private writeTasks(connection: TaskConnection, list: ManagedTaskEntity[]): void {
    list.forEach(validateManagedTask);
    const value = JSON.stringify(list), updatedAt = new Date().toISOString();
    connection.insert(userSettings).values({ key: MANAGED_TASKS_KEY, value, updatedAt })
      .onConflictDoUpdate({ target: userSettings.key, set: { value, updatedAt } }).run();
  }

  /** Update the opt-out inside the same transaction as the caller's priority mutation. */
  setDailyFocusExcluded(connection: TaskConnection, taskId: string, date: string, excluded: boolean): void {
    if (!isDateOnly(date)) throw new Error('Tanggal prioritas tidak valid.');
    const current = this.readTasks(connection), task = current.find(item => item.id === taskId);
    if (!task) return;
    const dates = task.excludedFocusDates ?? [];
    if (dates.includes(date) === excluded) return;
    this.writeTasks(connection, current.map(item => item.id === taskId ? {
      ...item, excludedFocusDates: excluded ? [...dates, date] : dates.filter(value => value !== date),
      updatedAt: new Date().toISOString(),
    } : item));
  }

  private reconcileAlarms(askPermission = false): Promise<void> {
    // Native work follows commit, in order, and always reads the latest committed tasks.
    this.alarmUpdates = this.alarmUpdates.then(() =>
      TaskAlarmNotificationService.reconcileTaskAlarms(this.readTasks(db), askPermission)
    ).catch(error => {
      console.warn('[ManagedTaskRepository] Pengingat belum dapat diselaraskan:', error);
    });
    return this.alarmUpdates;
  }

  private syncCoreTasks(tx: TaskConnection, all: ManagedTaskEntity[], completionId?: string): void {
    const todayDate = formatLocalDate(new Date());
    const nowIso = new Date().toISOString();
    for (const item of all) {
      const prefix = item.courseOrContext ? '[' + item.courseOrContext + '] ' : '';
      const formattedTitle = prefix + item.title;
      const subtitle = 'Jadwal kerjakan: ' + item.executionDate + ' ' + item.executionTime
        + ' · Deadline: ' + item.deadlineDate + ' ' + item.deadlineTime;
      const existing = tx.select().from(tasks).where(eq(tasks.id, item.id)).get();
      // Only an explicit completion action may replace an existing core status.
      const status = !existing || item.id === completionId
        ? item.isCompleted ? 'COMPLETED' : 'TODO'
        : normalizeTaskStatus(existing.status);
      const fields = {
        title: formattedTitle,
        name: formattedTitle,
        description: item.notes || subtitle,
        priority: item.priority,
        estimatedMinutes: item.estimatedMinutes,
        estimatedHours: Math.max(0.25, item.estimatedMinutes / 60),
        dueDate: item.deadlineDate,
        updatedAt: nowIso,
      };
      if (!existing) {
        tx.insert(tasks).values({
          ...fields, id: item.id, status, isCompleted: status === 'COMPLETED' ? 1 : 0,
          completedAt: item.completedAt, actualMinutes: 0, sortOrder: 0, createdAt: item.createdAt,
        }).run();
      } else {
        tx.update(tasks).set(fields).where(eq(tasks.id, item.id)).run();
      }
      writeTaskStatus(tx, item.id, status, nowIso);

      if (item.autoAddToToday && ['TODO', 'IN_PROGRESS'].includes(status) && item.executionDate <= todayDate
        && !item.excludedFocusDates?.includes(todayDate)) {
        const existingFocus = tx.select().from(dailyFocusItems).where(
          and(eq(dailyFocusItems.date, todayDate), eq(dailyFocusItems.taskId, item.id))
        ).get();
        if (!existingFocus) {
          const todayFocusRows = tx.select().from(dailyFocusItems).where(eq(dailyFocusItems.date, todayDate)).all();
          if (todayFocusRows.length < 5) {
            tx.insert(dailyFocusItems).values({
              id: 'df-mt-' + item.id + '-' + todayDate, date: todayDate, taskId: item.id,
              sortOrder: todayFocusRows.length, isCompleted: 0, createdAt: nowIso,
            }).run();
          }
        }
      }
    }
  }

  async syncWithCoreTasksAndToday(): Promise<void> {
    db.transaction(tx => this.syncCoreTasks(tx, this.readTasks(tx)));
  }

  async createTask(input: CreateManagedTaskInput): Promise<ManagedTaskEntity> {
    const nowIso = new Date().toISOString();
    const id = 'mtask-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

    const newTask: ManagedTaskEntity = {
      id,
      title: input.title.trim(),
      courseOrContext: (input.courseOrContext || '').trim(),
      categoryType: input.categoryType ?? 'COLLEGE',
      notes: input.notes?.trim() || null,
      priority: input.priority ?? 'HIGH',
      estimatedMinutes: input.estimatedMinutes ?? 60,
      executionDate: input.executionDate,
      executionTime: input.executionTime,
      deadlineDate: input.deadlineDate,
      deadlineTime: input.deadlineTime,
      alertMode: input.alertMode,
      alarmTrackId: input.alarmTrackId || BUILT_IN_ALARM_TRACKS[0]!.id,
      alarmTrackName: input.alarmTrackName || BUILT_IN_ALARM_TRACKS[0]!.name,
      alarmTrackUri:
        input.alarmTrackUri ?? BUILT_IN_ALARM_TRACKS[0]!.uri,
      snoozeMinutes: input.snoozeMinutes ?? 10,
      snoozedUntilIso: null,
      lastAlarmFiredKey: null,
      autoAddToToday: input.autoAddToToday ?? true,
      subtasks: (input.subtasks ?? [])
        .map((s) => s.trim())
        .filter(Boolean)
        .map((title, idx) => ({
          id: `sub-${Date.now()}-${idx}`,
          title,
          isCompleted: false,
        })),
      isCompleted: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    validateManagedTask(newTask);
    this.mutateTasks((current, tx) => {
      const updated = [newTask, ...current];
      this.syncCoreTasks(tx, updated);
      return updated;
    });
    notifyDataListeners();
    await this.reconcileAlarms(true);
    return newTask;
  }

  async toggleTaskCompletion(id: string): Promise<void> {
    this.mutateTasks((current, tx) => {
      if (!current.some(item => item.id === id)) throw new Error('Tugas tidak ditemukan.');
      const nowIso = new Date().toISOString();
      const updated = current.map(item => item.id === id ? {
        ...item, isCompleted: !item.isCompleted, completedAt: item.isCompleted ? null : nowIso,
        snoozedUntilIso: null, updatedAt: nowIso,
      } : item);
      this.syncCoreTasks(tx, updated, id);
      return updated;
    });
    if (currentRingingTask?.id === id) clearRingingAlarm();
    notifyDataListeners();
    await this.reconcileAlarms();
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    this.mutateTasks(current => current.map(item => item.id === taskId ? {
      ...item,
      subtasks: item.subtasks.map(subtask => subtask.id === subtaskId
        ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask),
      updatedAt: new Date().toISOString(),
    } : item));
    notifyDataListeners();
  }

  async deleteTask(id: string): Promise<void> {
    this.mutateTasks((current, tx) => {
      tx.delete(tasks).where(eq(tasks.id, id)).run();
      return current.filter(item => item.id !== id);
    });
    if (currentRingingTask?.id === id) clearRingingAlarm();
    notifyDataListeners();
    await this.reconcileAlarms();
  }

  async snoozeTaskAlarm(id: string, minutes: number): Promise<void> {
    if (!Number.isSafeInteger(minutes) || minutes <= 0) throw new Error('Durasi tunda harus berupa menit positif.');
    const snoozedUntilIso = new Date(Date.now() + minutes * 60_000).toISOString();
    this.mutateTasks(current => current.map(item => item.id === id ? {
      ...item, snoozedUntilIso, updatedAt: new Date().toISOString(),
    } : item));
    clearRingingAlarm();
    notifyDataListeners();
    await this.reconcileAlarms();
  }

  async dismissTaskAlarm(id: string): Promise<void> {
    const now = new Date();
    const todayKey = formatLocalDate(now) + '-' + now.getHours() + ':' + now.getMinutes();
    this.mutateTasks(current => current.map(item => item.id === id ? {
      ...item, snoozedUntilIso: null,
      lastAlarmFiredKey: item.executionDate + 'T' + item.executionTime + '|' + todayKey,
      updatedAt: now.toISOString(),
    } : item));
    clearRingingAlarm();
    notifyDataListeners();
    await this.reconcileAlarms();
  }

  /**
   * Mengecek apakah ada tugas berstatus ALARM / BOTH yang waktunya tiba saat ini.
   */
  async checkDueAlarmsNow(): Promise<ManagedTaskEntity | null> {
    if (currentRingingTask) return currentRingingTask;

    const all = await this.getAllTasks();
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentHm = `${hh}:${mm}`;

    for (const item of all) {
      if (item.isCompleted) continue;
      if (item.alertMode !== 'ALARM' && item.alertMode !== 'BOTH') continue;

      // 1. Check if snoozed alarm is due
      if (item.snoozedUntilIso) {
        const snoozeMs = Date.parse(item.snoozedUntilIso);
        if (Number.isFinite(snoozeMs) && Date.now() >= snoozeMs) {
          currentRingingTask = item;
          notifyAlarmListeners();
          return item;
        }
      }

      // 2. Check if scheduled executionDate + executionTime matches current minute
      const fireKey = `${item.executionDate}T${item.executionTime}`;
      if (
        item.executionDate === todayStr &&
        item.executionTime === currentHm &&
        !item.lastAlarmFiredKey?.startsWith(fireKey)
      ) {
        currentRingingTask = item;
        notifyAlarmListeners();
        return item;
      }
    }

    return null;
  }

  // ==========================================
  // Custom Uploaded Songs Management
  // ==========================================
  async getAllAlarmTracks(): Promise<CustomAlarmTrack[]> {
    try {
      const row = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.key, CUSTOM_TRACKS_KEY))
        .get();

      const customTracks: CustomAlarmTrack[] =
        row && row.value ? JSON.parse(row.value) : [];
      return [
        ...customTracks,
        ...BUILT_IN_ALARM_TRACKS,
      ];
    } catch {
      return [...BUILT_IN_ALARM_TRACKS];
    }
  }

  async addCustomAlarmTrack(track: CustomAlarmTrack): Promise<CustomAlarmTrack[]> {
    try {
      const row = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.key, CUSTOM_TRACKS_KEY))
        .get();

      const existing: CustomAlarmTrack[] =
        row && row.value ? JSON.parse(row.value) : [];
      const updated = [track, ...existing.filter((t) => t.id !== track.id)];
      const nowIso = new Date().toISOString();

      await db
        .insert(userSettings)
        .values({
          key: CUSTOM_TRACKS_KEY,
          value: JSON.stringify(updated),
          updatedAt: nowIso,
        })
        .onConflictDoUpdate({
          target: userSettings.key,
          set: {
            value: JSON.stringify(updated),
            updatedAt: nowIso,
          },
        });

      notifyDataListeners();
      return [...updated, ...BUILT_IN_ALARM_TRACKS];
    } catch {
      return [track, ...BUILT_IN_ALARM_TRACKS];
    }
  }
}

export const managedTaskRepository = new ManagedTaskRepository();

