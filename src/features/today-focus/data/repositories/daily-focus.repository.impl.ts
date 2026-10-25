import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
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
    const existing = await db
      .select()
      .from(dailyFocusItems)
      .where(
        and(eq(dailyFocusItems.date, date), eq(dailyFocusItems.taskId, taskId))
      );

    if (existing.length > 0) return;

    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(dailyFocusItems)
      .where(eq(dailyFocusItems.date, date));

    const currentCount = countRows[0]?.count || 0;
    if (currentCount >= 5) {
      throw new Error('Maksimal 5 fokus tugas per hari (Rule of 3-5 Priorities).');
    }

    await db.insert(dailyFocusItems).values({
      id: generateId(),
      date,
      taskId,
      sortOrder: currentCount + 1,
      isCompleted: 0,
      createdAt: new Date().toISOString(),
    });
  }

  async removeFocusItem(id: string): Promise<void> {
    await db.delete(dailyFocusItems).where(eq(dailyFocusItems.id, id));
  }

  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<void> {
    const now = new Date().toISOString();

    // Update task table
    await db
      .update(tasks)
      .set({
        isCompleted: isCompleted ? 1 : 0,
        status: isCompleted ? 'COMPLETED' : 'TODO',
        completedAt: isCompleted ? now : null,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    // Update daily focus table
    await db
      .update(dailyFocusItems)
      .set({
        isCompleted: isCompleted ? 1 : 0,
      })
      .where(eq(dailyFocusItems.taskId, taskId));
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

    await db.insert(tasks).values(newTaskRow);
    await this.addFocusItem(date, taskId);

    const created = await db.select().from(tasks).where(eq(tasks.id, taskId));
    return mapToTaskEntity(created[0]);
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

    const newRow = {
      id,
      taskId: input.taskId || null,
      mode: input.mode,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationMinutes: input.durationMinutes,
      rating: input.rating ?? null,
      obstacle: input.obstacle ?? null,
      nextAction: input.nextAction ?? null,
      createdAt: now,
    };

    await db.insert(focusSessions).values(newRow);

    if (input.taskId && input.durationMinutes > 0) {
      await this.incrementTaskActualMinutes(input.taskId, input.durationMinutes);
    }

    const created = await db
      .select()
      .from(focusSessions)
      .where(eq(focusSessions.id, id));

    return mapToSessionEntity(created[0]);
  }

  async incrementTaskActualMinutes(taskId: string, minutes: number): Promise<void> {
    const taskRows = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (taskRows.length === 0) return;

    const currentActual = taskRows[0].actualMinutes || 0;
    await db
      .update(tasks)
      .set({
        actualMinutes: currentActual + minutes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, taskId));
  }

  async getTodayCompletedMinutes(date: string): Promise<number> {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const rows = await db
      .select({
        totalMinutes: sql<number>`coalesce(sum(duration_minutes), 0)`,
      })
      .from(focusSessions)
      .where(
        sql`started_at >= ${startOfDay} AND started_at <= ${endOfDay}`
      );

    return rows[0]?.totalMinutes || 0;
  }
}

export const dailyFocusRepository = new DailyFocusRepositoryImpl();
