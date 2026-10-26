import { summarizeTasks } from '@/shared/domain/task-status';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories, lifePillars, targets, projects, stages, tasks, type LifePillar } from '@/db/schema';
import {
  type TargetEntity,
  type LifePillarEntity,
  type CreateTargetInput,
  type UpdateTargetInput,
} from '../../domain/entities/target.entity';
import type {
  TargetRepository,
  TargetFilterOptions,
} from '../../domain/repositories/target.repository';

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

function mapToPillarEntity(row: LifePillar): LifePillarEntity {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sortOrder,
  };
}

export class TargetRepositoryImpl implements TargetRepository {
  async getPillars(): Promise<LifePillarEntity[]> {
    const rows = await db.select().from(lifePillars).orderBy(lifePillars.sortOrder);
    return rows.map(mapToPillarEntity);
  }

  async getTargets(filter?: TargetFilterOptions): Promise<TargetEntity[]> {
    const conditions = [];
    if (filter?.categoryId) {
      conditions.push(eq(targets.categoryId, filter.categoryId));
    }
    if (filter?.pillarId) {
      conditions.push(eq(targets.pillarId, filter.pillarId));
    }
    if (filter?.status) {
      conditions.push(eq(targets.status, filter.status));
    }

    let targetRows;
    if (conditions.length > 0) {
      targetRows = await db
        .select()
        .from(targets)
        .where(and(...conditions))
        .orderBy(desc(targets.updatedAt));
    } else {
      targetRows = await db.select().from(targets).orderBy(desc(targets.updatedAt));
    }

    // Load all categories for name resolution
    const categoryRows = await db.select().from(categories);
    const catMap = new Map<string, string>();
    for (const c of categoryRows) {
      catMap.set(c.id, c.name);
    }

    // Load stages and tasks to calculate task-based progress
    const allStages = await db.select().from(stages).where(eq(stages.parentType, 'TARGET'));
    const allTasks = await db.select().from(tasks);
    const projectTargets = new Map((await db.select({ id: projects.id, targetId: projects.targetId }).from(projects)).map(project => [project.id, project.targetId]));

    // Map stages to targets
    const targetStagesMap = new Map<string, string[]>();
    for (const s of allStages) {
      const list = targetStagesMap.get(s.parentId) || [];
      list.push(s.id);
      targetStagesMap.set(s.parentId, list);
    }

    return targetRows.map((t) => {
      const stageIds = targetStagesMap.get(t.id) || [];
      const targetTasks = allTasks.filter((task) => {
        if (task.stageId && stageIds.includes(task.stageId)) return true;
        if (task.targetId === t.id) return true;
        if (task.projectId && projectTargets.get(task.projectId) === t.id) return true;
        return false;
      });

      const { totalTasks, completedTasks, progressPercent, totalEstimatedHours } = summarizeTasks(targetTasks);

      const catName = t.categoryId ? (catMap.get(t.categoryId) || 'Umum') : 'Umum';

      return {
        id: t.id,
        categoryId: t.categoryId || 'cat-karier',
        categoryName: catName,
        pillarId: t.pillarId,
        title: t.title,
        description: t.description,
        status: (t.status as TargetEntity['status']) || 'ACTIVE',
        priority: (t.priority as TargetEntity['priority']) || 'MEDIUM',
        totalTasks,
        completedTasks,
        progressPercent,
        totalEstimatedHours,
        startDate: t.startDate,
        targetDate: t.targetDate,
        completedAt: t.completedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });
  }

  async getTargetById(id: string): Promise<TargetEntity | null> {
    const list = await this.getTargets();
    return list.find((t) => t.id === id) || null;
  }

  async createTarget(input: CreateTargetInput): Promise<TargetEntity> {
    const cleanTitle = input.title.trim();
    if (!cleanTitle) {
      throw new Error('Nama target wajib diisi.');
    }
    if (!input.categoryId) {
      throw new Error('Kategori wajib dipilih.');
    }

    const now = new Date().toISOString();
    const id = generateId();

    await db.insert(targets).values({
      id,
      categoryId: input.categoryId,
      pillarId: input.pillarId || null,
      title: cleanTitle,
      description: input.description?.trim() || null,
      type: 'MILESTONE_BASED',
      targetValue: 100.0,
      currentValue: 0.0,
      unit: '%',
      status: 'ACTIVE',
      priority: input.priority || 'MEDIUM',
      startDate: now,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.getTargetById(id);
    return created!;
  }

  async updateTarget(id: string, updates: UpdateTargetInput): Promise<void> {
    const patch: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.title !== undefined) {
      const cleanTitle = updates.title.trim();
      if (!cleanTitle) throw new Error('Nama target tidak boleh kosong.');
      patch.title = cleanTitle;
    }
    if (updates.categoryId !== undefined) {
      patch.categoryId = updates.categoryId;
    }
    if (updates.description !== undefined) {
      patch.description = updates.description?.trim() || null;
    }
    if (updates.priority !== undefined) {
      patch.priority = updates.priority;
    }

    await db.update(targets).set(patch).where(eq(targets.id, id));
  }

  async deleteTarget(id: string): Promise<void> {
    await db.delete(targets).where(eq(targets.id, id));
  }
}

export const targetRepository = new TargetRepositoryImpl();
