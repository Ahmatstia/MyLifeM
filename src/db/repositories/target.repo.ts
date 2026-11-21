import { eq, and, desc } from 'drizzle-orm';
import { db } from '../client';
import { lifePillars, targets, tasks, type Target, type NewTarget, type LifePillar } from '../schema';
import { removeOrphanQuickTaskDetails } from '@/shared/data/quick-task-details';

export const targetRepo = {
  async getPillars(): Promise<LifePillar[]> {
    return await db.select().from(lifePillars).orderBy(lifePillars.sortOrder);
  },

  async getTargets(filter?: { pillarId?: string; status?: string }): Promise<Target[]> {
    const conditions = [];
    if (filter?.pillarId) {
      conditions.push(eq(targets.pillarId, filter.pillarId));
    }
    if (filter?.status) {
      conditions.push(eq(targets.status, filter.status));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(targets)
        .where(and(...conditions))
        .orderBy(desc(targets.updatedAt));
    }

    return await db.select().from(targets).orderBy(desc(targets.updatedAt));
  },

  async getTargetById(id: string): Promise<Target | undefined> {
    const rows = await db.select().from(targets).where(eq(targets.id, id));
    return rows[0];
  },

  async createTarget(data: NewTarget): Promise<Target> {
    const now = new Date().toISOString();
    const newTarget: NewTarget = {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    await db.insert(targets).values(newTarget);
    return (await this.getTargetById(newTarget.id))!;
  },

  async updateTarget(id: string, updates: Partial<NewTarget>): Promise<void> {
    await db
      .update(targets)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(targets.id, id));
  },

  async deleteTarget(id: string): Promise<void> {
    db.transaction(tx => { tx.delete(targets).where(eq(targets.id, id)).run(); removeOrphanQuickTaskDetails(tx); });
  },

  async getTargetDetails(id: string) {
    const target = await this.getTargetById(id);
    if (!target) return null;

    const targetTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.targetId, id));

    return {
      target,
      tasks: targetTasks,
    };
  },
};
