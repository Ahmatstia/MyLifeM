import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { isDateOnly, localDayBounds, parseInstant } from '@/shared/utils/local-date';
import {
  dailyFocusItems,
  tasks,
  focusSessions,
  type Task,
  type FocusSession,
} from '@/db/schema';
import type {
  DailyFocusItemEntity,
  TaskEntity,
  FocusSessionEntity,
  SaveSessionInput,
} from '../../domain/entities/daily-focus.entity';
import type { DailyFocusRepository } from '../../domain/repositories/daily-focus.repository';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function mapToTaskEntity(row: Task): TaskEntity {
  return {
    id: row.id,
    projectId: row.projectId,
    targetId: row.targetId,
    milestoneId: row.milestoneId,
    title: row.title,
    description: row.description,
    priority: row.priority as TaskEntity['priority'],
    status: row.status as TaskEntity['status'],
    estimatedMinutes: row.estimatedMinutes,
    actualMinutes: row.actualMinutes,
    dueDate: row.dueDate,
    isCompleted: row.isCompleted === 1,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapToSessionEntity(row: FocusSession): FocusSessionEntity {
  return {
    id: row.id,
    taskId: row.taskId,
    taskTitle: row.taskTitle,
    mode: row.mode as FocusSessionEntity['mode'],
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    durationMinutes: row.durationMinutes,
    rating: row.rating,
    obstacle: row.obstacle,
    nextAction: row.nextAction,
    createdAt: row.createdAt,
  };
}

function addPriority(tx: Pick<typeof db, 'select' | 'insert'>, date: string, taskId: string): void {
    if (!isDateOnly(date)) throw new Error('Tanggal prioritas harus valid dalam format TTTT-BB-HH.');
    const existing = tx
      .select()
      .from(dailyFocusItems)
      .where(
        and(eq(dailyFocusItems.date, date), eq(dailyFocusItems.taskId, taskId))
      ).all();

    if (existing.length > 0) return;

    const countRows = tx
      .select({ count: sql<number>`count(*)` })
      .from(dailyFocusItems)
      .where(eq(dailyFocusItems.date, date)).all();

    const currentCount = countRows[0]?.count || 0;
    if (currentCount >= 5) {
      throw new Error('Maksimal 5 fokus tugas per hari (Rule of 3-5 Priorities).');
    }

    tx.insert(dailyFocusItems).values({
      id: generateId(),
      date,
      taskId,
      sortOrder: currentCount + 1,
      isCompleted: 0,
      createdAt: new Date().toISOString(),
    }).run();
}

export class DailyFocusRepositoryImpl implements DailyFocusRepository {
  async getTodayFocusItems(date: string): Promise<DailyFocusItemEntity[]> {
    const focusRows = await db
      .select()
      .from(dailyFocusItems)
      .where(eq(dailyFocusItems.date, date))
      .orderBy(dailyFocusItems.sortOrder);

    if (focusRows.length === 0) return [];

    const result: DailyFocusItemEntity[] = [];
    for (const item of focusRows) {
      const taskRows = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, item.taskId));

      if (taskRows.length > 0) {
        result.push({
          id: item.id,
          date: item.date,
          taskId: item.taskId,
          sortOrder: item.sortOrder,
          isCompleted: item.isCompleted === 1,
          createdAt: item.createdAt,
          task: mapToTaskEntity(taskRows[0]),
        });
      }
    }

    return result;
  }

  async addFocusItem(date: string, taskId: string): Promise<void> {
    db.transaction(tx => addPriority(tx, date, taskId));
  }

  async removeFocusItem(id: string): Promise<void> {
    await db.delete(dailyFocusItems).where(eq(dailyFocusItems.id, id));
  }

  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<void> {
    const now = new Date().toISOString();

    db.transaction(tx => {
    // Update task table
    tx
      .update(tasks)
      .set({
        isCompleted: isCompleted ? 1 : 0,
        status: isCompleted ? 'COMPLETED' : 'TODO',
        completedAt: isCompleted ? now : null,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId)).run();

    // Update daily focus table
    tx
      .update(dailyFocusItems)
      .set({
        isCompleted: isCompleted ? 1 : 0,
      })
      .where(eq(dailyFocusItems.taskId, taskId)).run();
    });
  }

  async createQuickTask(
    title: string,
    date: string,
    targetId?: string
  ): Promise<TaskEntity> {
    const now = new Date().toISOString();
    const taskId = generateId();

    const newTaskRow = {
      id: taskId,
      projectId: null,
      targetId: targetId || null,
      milestoneId: null,
      title: title.trim(),
      description: null,
      priority: 'MEDIUM' as const,
      status: 'TODO' as const,
      estimatedMinutes: 25,
      actualMinutes: 0,
      dueDate: date,
      isCompleted: 0,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    if (!newTaskRow.title) throw new Error('Nama tugas wajib diisi.');
    return db.transaction(tx => {
      tx.insert(tasks).values(newTaskRow).run();
      addPriority(tx, date, taskId);
      return mapToTaskEntity(tx.select().from(tasks).where(eq(tasks.id, taskId)).get()!);
    });
  }

  async getAvailableTasks(): Promise<TaskEntity[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.isCompleted, 0))
      .orderBy(desc(tasks.updatedAt));

    return rows.map(mapToTaskEntity);
  }

  async saveFocusSession(input: SaveSessionInput): Promise<FocusSessionEntity> {
    const id = generateId();
    const now = new Date().toISOString();
    const startedAt = parseInstant(input.startedAt).toISOString();
    const endedAt = parseInstant(input.endedAt).toISOString();
    if (endedAt < startedAt) throw new Error('Waktu selesai sesi tidak boleh mendahului mulai.');

    const newRow = {
      id,
      taskId: input.taskId || null,
      mode: input.mode,
      startedAt,
      endedAt,
      durationMinutes: input.durationMinutes,
      rating: input.rating ?? null,
      obstacle: input.obstacle ?? null,
      nextAction: input.nextAction ?? null,
      createdAt: now,
    };

    if (!Number.isSafeInteger(input.durationMinutes) || input.durationMinutes < 0) throw new Error('Durasi sesi tidak valid.');
    return db.transaction(tx => {
      const taskTitle = input.taskId ? tx.select({ title: tasks.title }).from(tasks).where(eq(tasks.id, input.taskId)).get()?.title ?? null : null;
      tx.insert(focusSessions).values({ ...newRow, taskTitle }).run();
      if (input.taskId && input.durationMinutes > 0) {
        tx.update(tasks).set({ actualMinutes: sql`${tasks.actualMinutes} + ${input.durationMinutes}`, updatedAt: now })
          .where(eq(tasks.id, input.taskId)).run();
      }
      return mapToSessionEntity(tx.select().from(focusSessions).where(eq(focusSessions.id, id)).get()!);
    });
  }

  async incrementTaskActualMinutes(taskId: string, minutes: number): Promise<void> {
    if (!Number.isSafeInteger(minutes) || minutes < 0) throw new Error('Durasi tugas tidak valid.');
    await db.update(tasks).set({ actualMinutes: sql`${tasks.actualMinutes} + ${minutes}`, updatedAt: new Date().toISOString() }).where(eq(tasks.id, taskId));
  }

  async getTodayCompletedMinutes(date: string): Promise<number> {
    const { start, end } = localDayBounds(date);

    const rows = await db
      .select({
        startedAt: focusSessions.startedAt, durationMinutes: focusSessions.durationMinutes,
      })
      .from(focusSessions)
      .where(
        sql`(julianday(${focusSessions.startedAt}) >= julianday(${start.toISOString()}) AND julianday(${focusSessions.startedAt}) < julianday(${end.toISOString()})) OR substr(${focusSessions.startedAt},1,10) = ${date}`
      );

    return rows.reduce((sum, row) => { const time = parseInstant(row.startedAt); return sum + (time >= start && time < end ? row.durationMinutes : 0); }, 0);
  }
}

export const dailyFocusRepository = new DailyFocusRepositoryImpl();
