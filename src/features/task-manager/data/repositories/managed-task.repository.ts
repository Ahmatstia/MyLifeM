import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { normalizeTaskStatus } from '@/shared/domain/task-status';
import { writeTaskStatus } from '@/shared/data/task-status';
import { removeOrphanQuickTaskDetails } from '@/shared/data/quick-task-details';
import { userSettings, tasks, dailyFocusItems } from '@/db/schema';
import { formatLocalDate, isDateOnly, localTimeToIso } from '@/shared/utils/local-date';
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

type AlarmListener = (ringingTask: ManagedTaskEntity | null, isTest: boolean) => void;
type DataListener = () => void;

let currentRingingTask: ManagedTaskEntity | null = null;
let currentAlarmIsTest = false;
const silencedOccurrences = new Map<string, string>();
const alarmListeners = new Set<AlarmListener>();
const dataListeners = new Set<DataListener>();

function notifyAlarmListeners() {
  for (const fn of alarmListeners) {
    fn(currentRingingTask, currentAlarmIsTest);
  }
}

function notifyDataListeners() {
  for (const fn of dataListeners) {
    fn();
  }
}

export function subscribeRingingAlarm(fn: AlarmListener): () => void {
  alarmListeners.add(fn);
  fn(currentRingingTask, currentAlarmIsTest);
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
  currentAlarmIsTest = true;
  notifyAlarmListeners();
}

export function clearRingingAlarm(): void {
  if (currentRingingTask && !currentAlarmIsTest) {
    silencedOccurrences.set(currentRingingTask.id, alarmOccurrenceKey(currentRingingTask));
  }
  currentRingingTask = null;
  currentAlarmIsTest = false;
  notifyAlarmListeners();
}

function alarmOccurrenceKey(task: ManagedTaskEntity): string {
  return task.snoozedUntilIso ? 'snooze:' + task.snoozedUntilIso : task.executionDate + 'T' + task.executionTime;
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
    this.alarmUpdates = this.alarmUpdates.then(async () => {
      await TaskAlarmNotificationService.reconcileTaskAlarms(this.readAlarmTasks(), askPermission);
    }).catch(error => {
      console.warn('[ManagedTaskRepository] Pengingat belum dapat diselaraskan:', error);
    });
    return this.alarmUpdates;
  }

  syncAlarms(askPermission = false): Promise<void> { return this.reconcileAlarms(askPermission); }

  async openAlarmFromNotification(id: string, occurrence: string | null): Promise<boolean> {
    const task = this.readAlarmTasks().find(item => item.id === id);
    if (!task || task.isCompleted || (task.alertMode !== 'ALARM' && task.alertMode !== 'BOTH') || occurrence !== alarmOccurrenceKey(task)) return false;
    const due = task.snoozedUntilIso ? Date.parse(task.snoozedUntilIso) : Date.parse(localTimeToIso(task.executionDate, task.executionTime));
    if (due > Date.now() || Date.now() - due > 86_400_000 || silencedOccurrences.get(id) === occurrence
      || (!task.snoozedUntilIso && task.lastAlarmFiredKey?.startsWith(task.executionDate + 'T' + task.executionTime))) return false;
    if (currentRingingTask) return currentRingingTask.id === id;
    currentRingingTask = task; currentAlarmIsTest = false; notifyAlarmListeners(); return true;
  }

  private readAlarmTasks(): ManagedTaskEntity[] {
    const cancelled = new Set(db.select({ id: tasks.id }).from(tasks).where(eq(tasks.status, 'CANCELLED')).all().map(task => task.id));
    return this.readTasks(db).filter(task => !cancelled.has(task.id));
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
      removeOrphanQuickTaskDetails(tx);
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

    const all = this.readAlarmTasks();
    const now = new Date();
    for (const item of all) {
      if (silencedOccurrences.get(item.id) === alarmOccurrenceKey(item)) continue;
      if (item.isCompleted) continue;
      if (item.alertMode !== 'ALARM' && item.alertMode !== 'BOTH') continue;

      // 1. Check if snoozed alarm is due
      if (item.snoozedUntilIso) {
        const snoozeMs = Date.parse(item.snoozedUntilIso);
        if (Number.isFinite(snoozeMs) && now.getTime() >= snoozeMs && now.getTime() - snoozeMs <= 86_400_000) {
          currentRingingTask = item;
          currentAlarmIsTest = false;
          notifyAlarmListeners();
          return item;
        }
        continue;
      }

      // Catch up once for up to 24 hours after execution, including a resume after the scheduled minute.
      const fireKey = `${item.executionDate}T${item.executionTime}`;
      const executionMs = Date.parse(localTimeToIso(item.executionDate, item.executionTime));
      if (
        executionMs <= now.getTime() && now.getTime() - executionMs <= 86_400_000 &&
        !item.lastAlarmFiredKey?.startsWith(fireKey)
      ) {
        currentRingingTask = item;
        currentAlarmIsTest = false;
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
    if (!track.id.trim() || !track.name.trim() || !track.uri.trim() || track.isBuiltIn !== false) throw new Error('Data lagu kustom tidak valid.');
    const updated = db.transaction(tx => {
      const row = tx.select().from(userSettings).where(eq(userSettings.key, CUSTOM_TRACKS_KEY)).get();
      const existing: CustomAlarmTrack[] = row ? JSON.parse(row.value) : [];
      if (!Array.isArray(existing)) throw new Error('Daftar lagu kustom tidak valid.');
      const next = [track, ...existing.filter(item => item.id !== track.id)];
      const value = JSON.stringify(next), updatedAt = new Date().toISOString();
      tx.insert(userSettings).values({ key: CUSTOM_TRACKS_KEY, value, updatedAt })
        .onConflictDoUpdate({ target: userSettings.key, set: { value, updatedAt } }).run();
      return next;
    });
    notifyDataListeners();
    return [...updated, ...BUILT_IN_ALARM_TRACKS];
  }

}

export const managedTaskRepository = new ManagedTaskRepository();

