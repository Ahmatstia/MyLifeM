import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { userSettings, tasks, dailyFocusItems } from '@/db/schema';
import { formatLocalDate } from '@/shared/utils/local-date';
import {
  BUILT_IN_ALARM_TRACKS,
  type CreateManagedTaskInput,
  type CustomAlarmTrack,
  type ManagedTaskEntity,
} from '../../domain/entities/managed-task.entity';
import { TaskAlarmNotificationService } from '../services/task-alarm-notification.service';

const MANAGED_TASKS_KEY = 'managed_tasks_v1';
const CUSTOM_TRACKS_KEY = 'custom_alarm_tracks_v1';

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
  async getAllTasks(): Promise<ManagedTaskEntity[]> {
    try {
      const row = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.key, MANAGED_TASKS_KEY))
        .get();

      if (!row || !row.value) return [];
      const parsed = JSON.parse(row.value);
      if (!Array.isArray(parsed)) return [];

      // Synchronize completion status from the core `tasks` table in case user checked it off on "Hari Ini"
      const coreTasks = await db.select().from(tasks);
      const coreMap = new Map(coreTasks.map((t) => [t.id, t]));

      let changed = false;
      const synced: ManagedTaskEntity[] = parsed.map((item: ManagedTaskEntity) => {
        const core = coreMap.get(item.id);
        if (core) {
          const coreDone = core.isCompleted === 1 || core.status === 'COMPLETED';
          if (coreDone !== item.isCompleted) {
            changed = true;
            return {
              ...item,
              isCompleted: coreDone,
              completedAt: coreDone
                ? core.completedAt || new Date().toISOString()
                : null,
            };
          }
        }
        return item;
      });

      if (changed) {
        await this.saveTasksArray(synced);
      }

      return synced.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        const execA = `${a.executionDate}T${a.executionTime}`;
        const execB = `${b.executionDate}T${b.executionTime}`;
        return execA.localeCompare(execB);
      });
    } catch {
      return [];
    }
  }

  private async saveTasksArray(list: ManagedTaskEntity[]): Promise<void> {
    const nowIso = new Date().toISOString();
    await db
      .insert(userSettings)
      .values({
        key: MANAGED_TASKS_KEY,
        value: JSON.stringify(list),
        updatedAt: nowIso,
      })
      .onConflictDoUpdate({
        target: userSettings.key,
        set: {
          value: JSON.stringify(list),
          updatedAt: nowIso,
        },
      });
  }

  /**
   * Sinkronisasi otomatis tugas yang jadwal pengerjaannya (executionDate) adalah hari ini
   * (atau sudah lewat namun belum selesai) ke tabel `tasks` dan `daily_focus_items` (Layar Hari Ini).
   */
  async syncWithCoreTasksAndToday(
    list?: ManagedTaskEntity[]
  ): Promise<void> {
    try {
      const all = list ?? (await this.getAllTasks());
      const todayDate = formatLocalDate(new Date());
      const nowIso = new Date().toISOString();

      for (const item of all) {
        const prefix = item.courseOrContext
          ? `[${item.courseOrContext}] `
          : '';
        const formattedTitle = `${prefix}${item.title}`;
        const subtitleDesc = `Jadwal kerjakan: ${item.executionDate} ${item.executionTime} · Deadline: ${item.deadlineDate} ${item.deadlineTime}`;

        const existingTask = await db
          .select()
          .from(tasks)
          .where(eq(tasks.id, item.id))
          .get();

        if (!existingTask) {
          await db.insert(tasks).values({
            id: item.id,
            title: formattedTitle,
            name: formattedTitle,
            description: item.notes || subtitleDesc,
            priority: item.priority,
            status: item.isCompleted ? 'COMPLETED' : 'TODO',
            estimatedHours: Math.max(0.25, item.estimatedMinutes / 60),
            estimatedMinutes: item.estimatedMinutes,
            actualMinutes: 0,
            sortOrder: 0,
            dueDate: item.deadlineDate,
            isCompleted: item.isCompleted ? 1 : 0,
            completedAt: item.completedAt,
            createdAt: item.createdAt,
            updatedAt: nowIso,
          });
        } else {
          await db
            .update(tasks)
            .set({
              title: formattedTitle,
              name: formattedTitle,
              description: item.notes || subtitleDesc,
              priority: item.priority,
              status: item.isCompleted ? 'COMPLETED' : 'TODO',
              estimatedMinutes: item.estimatedMinutes,
              estimatedHours: Math.max(0.25, item.estimatedMinutes / 60),
              dueDate: item.deadlineDate,
              isCompleted: item.isCompleted ? 1 : 0,
              completedAt: item.completedAt,
              updatedAt: nowIso,
            })
            .where(eq(tasks.id, item.id));
        }

        // Auto-add to Today Focus if executionDate <= todayDate and autoAddToToday is enabled
        if (
          item.autoAddToToday &&
          !item.isCompleted &&
          item.executionDate <= todayDate
        ) {
          const existingFocus = await db
            .select()
            .from(dailyFocusItems)
            .where(
              and(
                eq(dailyFocusItems.date, todayDate),
                eq(dailyFocusItems.taskId, item.id)
              )
            )
            .get();

          if (!existingFocus) {
            const todayFocusRows = await db
              .select()
              .from(dailyFocusItems)
              .where(eq(dailyFocusItems.date, todayDate));

            if (todayFocusRows.length < 5) {
              await db.insert(dailyFocusItems).values({
                id: `df-mt-${item.id}-${todayDate}`,
                date: todayDate,
                taskId: item.id,
                sortOrder: todayFocusRows.length,
                isCompleted: item.isCompleted ? 1 : 0,
                createdAt: nowIso,
              });
            }
          }
        }
      }
    } catch {
      // Ignore sync errors on non-DB environments
    }
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

    const current = await this.getAllTasks();
    const updated = [newTask, ...current];
    await this.saveTasksArray(updated);
    await this.syncWithCoreTasksAndToday(updated);
    await TaskAlarmNotificationService.reconcileTaskAlarms(updated, true);
    notifyDataListeners();
    return newTask;
  }

  async toggleTaskCompletion(id: string): Promise<void> {
    const current = await this.getAllTasks();
    const nowIso = new Date().toISOString();
    const updated = current.map((item) => {
      if (item.id !== id) return item;
      const nextDone = !item.isCompleted;
      return {
        ...item,
        isCompleted: nextDone,
        completedAt: nextDone ? nowIso : null,
        snoozedUntilIso: null,
        updatedAt: nowIso,
      };
    });

    await this.saveTasksArray(updated);
    await this.syncWithCoreTasksAndToday(updated);
    await TaskAlarmNotificationService.reconcileTaskAlarms(updated, false);
    if (currentRingingTask?.id === id) {
      clearRingingAlarm();
    }
    notifyDataListeners();
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    const current = await this.getAllTasks();
    const nowIso = new Date().toISOString();
    const updated = current.map((item) => {
      if (item.id !== taskId) return item;
      return {
        ...item,
        subtasks: item.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        ),
        updatedAt: nowIso,
      };
    });
    await this.saveTasksArray(updated);
    notifyDataListeners();
  }

  async deleteTask(id: string): Promise<void> {
    const current = await this.getAllTasks();
    const updated = current.filter((item) => item.id !== id);
    await this.saveTasksArray(updated);
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
    } catch {
      // Ignore if core task already deleted
    }
    await TaskAlarmNotificationService.reconcileTaskAlarms(updated, false);
    if (currentRingingTask?.id === id) {
      clearRingingAlarm();
    }
    notifyDataListeners();
  }

  async snoozeTaskAlarm(id: string, minutes: number): Promise<void> {
    const current = await this.getAllTasks();
    const nowIso = new Date().toISOString();
    const snoozeUntil = new Date(Date.now() + minutes * 60_000).toISOString();

    const updated = current.map((item) =>
      item.id === id
        ? {
            ...item,
            snoozedUntilIso: snoozeUntil,
            updatedAt: nowIso,
          }
        : item
    );

    await this.saveTasksArray(updated);
    await TaskAlarmNotificationService.reconcileTaskAlarms(updated, false);
    clearRingingAlarm();
    notifyDataListeners();
  }

  async dismissTaskAlarm(id: string): Promise<void> {
    const current = await this.getAllTasks();
    const nowIso = new Date().toISOString();
    const todayKey = `${formatLocalDate(new Date())}-${new Date().getHours()}:${new Date().getMinutes()}`;

    const updated = current.map((item) =>
      item.id === id
        ? {
            ...item,
            snoozedUntilIso: null,
            lastAlarmFiredKey: `${item.executionDate}T${item.executionTime}|${todayKey}`,
            updatedAt: nowIso,
          }
        : item
    );

    await this.saveTasksArray(updated);
    await TaskAlarmNotificationService.reconcileTaskAlarms(updated, false);
    clearRingingAlarm();
    notifyDataListeners();
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

