import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { stages, tasks } from '@/db/schema';
import type { StageRepository } from '../../domain/repositories/stage.repository';
import {
  type StageWithTasks,
  type StageEntity,
  type TaskItemEntity,
  type CreateStageInput,
  type UpdateStageInput,
  type CreateTaskInput,
  type UpdateTaskInput,
  type StageParentType,
  type TaskStatus,
  type TaskPriority,
  calculateStageStatus,
} from '../../domain/entities/stage.entity';

export class StageRepositoryImpl implements StageRepository {
  async getStagesWithTasks(parentType: StageParentType, parentId: string): Promise<StageWithTasks[]> {
    const stageRows = await db
      .select()
      .from(stages)
      .where(and(eq(stages.parentType, parentType), eq(stages.parentId, parentId)))
      .orderBy(asc(stages.sortOrder), asc(stages.createdAt));

    const stageIds = stageRows.map((s) => s.id);
    const allTasks: TaskItemEntity[] = [];

    if (stageIds.length > 0) {
      const taskRows = await db
        .select()
        .from(tasks)
        .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));

      for (const t of taskRows) {
        if (t.stageId && stageIds.includes(t.stageId)) {
          // Normalize status
          let normStatus: TaskStatus = 'TODO';
          if (t.status === 'IN_PROGRESS') {
            normStatus = 'IN_PROGRESS';
          } else if (t.status === 'COMPLETED' || t.status === 'DONE' || t.isCompleted === 1) {
            normStatus = 'DONE';
          }

          let normPriority: TaskPriority = 'MEDIUM';
          if (t.priority === 'LOW' || t.priority === 'HIGH') {
            normPriority = t.priority;
          }

          allTasks.push({
            id: t.id,
            stageId: t.stageId,
            name: t.name || t.title,
            description: t.description,
            priority: normPriority,
            estimatedHours: t.estimatedHours ? Number(t.estimatedHours) : Math.max(1, Math.round((t.estimatedMinutes || 60) / 60)),
            status: normStatus,
            orderIndex: t.sortOrder || 0,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          });
        }
      }
    }

    return stageRows.map((s) => {
      const stageTasks = allTasks.filter((t) => t.stageId === s.id);
      const stageStatus = calculateStageStatus(stageTasks);
      const completedTasks = stageTasks.filter((t) => t.status === 'DONE').length;
      const totalEstimatedHours = Math.round(
        stageTasks.reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0) * 10
      ) / 10;

      return {
        id: s.id,
        parentType: s.parentType as StageParentType,
        parentId: s.parentId,
        name: s.name,
        description: s.description,
        sortOrder: s.sortOrder,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        tasks: stageTasks,
        status: stageStatus,
        totalTasks: stageTasks.length,
        completedTasks,
        totalEstimatedHours,
      };
    });
  }

  async createStage(input: CreateStageInput): Promise<StageEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama tahapan wajib diisi.');
    }

    // Determine next sort order
    const existingStages = await db
      .select({ sortOrder: stages.sortOrder })
      .from(stages)
      .where(and(eq(stages.parentType, input.parentType), eq(stages.parentId, input.parentId)))
      .orderBy(desc(stages.sortOrder));

    const nextSort = existingStages.length > 0 ? (existingStages[0].sortOrder || 0) + 1 : 0;
    const now = new Date().toISOString();
    const id = `stg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(stages).values({
      id,
      parentType: input.parentType,
      parentId: input.parentId,
      targetId: input.parentType === 'TARGET' ? input.parentId : null,
      projectId: input.parentType === 'PROJECT' ? input.parentId : null,
      name: cleanName,
      description: input.description?.trim() || null,
      sortOrder: nextSort,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      parentType: input.parentType,
      parentId: input.parentId,
      name: cleanName,
      description: input.description?.trim() || null,
      sortOrder: nextSort,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateStage(id: string, input: UpdateStageInput): Promise<StageEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama tahapan tidak boleh kosong.');
    }

    const now = new Date().toISOString();
    await db
      .update(stages)
      .set({
        name: cleanName,
        description: input.description?.trim() || null,
        updatedAt: now,
      })
      .where(eq(stages.id, id));

    const updated = await db.select().from(stages).where(eq(stages.id, id));
    if (updated.length === 0) throw new Error('Tahapan tidak ditemukan.');

    const s = updated[0];
    return {
      id: s.id,
      parentType: s.parentType as StageParentType,
      parentId: s.parentId,
      name: s.name,
      description: s.description,
      sortOrder: s.sortOrder,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  async deleteStage(id: string): Promise<void> {
    await db.delete(stages).where(eq(stages.id, id));
  }

  async reorderStage(id: string, direction: 'UP' | 'DOWN'): Promise<void> {
    db.transaction(tx => {
      const current = tx.select().from(stages).where(eq(stages.id, id)).all();
      if (current.length === 0) return;
      const target = current[0];

      const allInParent = tx
        .select()
        .from(stages)
        .where(and(eq(stages.parentType, target.parentType), eq(stages.parentId, target.parentId)))
        .orderBy(asc(stages.sortOrder), asc(stages.createdAt)).all();

      const currentIndex = allInParent.findIndex((s) => s.id === id);
      if (currentIndex === -1) return;

      const swapIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= allInParent.length) return;

      const other = allInParent[swapIndex];

      // Swap sortOrders
      const targetOrder = target.sortOrder;
      const otherOrder = other.sortOrder;

      tx.update(stages).set({ sortOrder: otherOrder }).where(eq(stages.id, target.id)).run();
      tx.update(stages).set({ sortOrder: targetOrder }).where(eq(stages.id, other.id)).run();
    });
  }

  async createTask(input: CreateTaskInput): Promise<TaskItemEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama tugas wajib diisi.');
    }

    const hours = Number(input.estimatedHours);
    if (isNaN(hours) || hours <= 0) {
      throw new Error('Estimasi waktu harus berupa angka lebih besar dari 0.');
    }

    // Determine parent target/project from stage
    const stageRow = await db.select().from(stages).where(eq(stages.id, input.stageId));
    if (stageRow.length === 0) {
      throw new Error('Tahapan tidak ditemukan.');
    }

    const stage = stageRow[0];
    const parentTargetId = stage.parentType === 'TARGET' ? stage.parentId : null;
    const parentProjectId = stage.parentType === 'PROJECT' ? stage.parentId : null;

    const now = new Date().toISOString();
    const id = `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const status: TaskStatus = input.status || 'TODO';
    const priority: TaskPriority = input.priority || 'MEDIUM';

    await db.insert(tasks).values({
      id,
      stageId: input.stageId,
      targetId: parentTargetId,
      projectId: parentProjectId,
      title: cleanName,
      name: cleanName,
      description: input.description?.trim() || null,
      priority,
      status: status === 'DONE' ? 'COMPLETED' : status,
      isCompleted: status === 'DONE' ? 1 : 0,
      completedAt: status === 'DONE' ? now : null,
      estimatedHours: hours,
      estimatedMinutes: Math.round(hours * 60),
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      stageId: input.stageId,
      name: cleanName,
      description: input.description?.trim() || null,
      priority,
      estimatedHours: hours,
      status,
      orderIndex: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<TaskItemEntity> {
    const existing = await db.select().from(tasks).where(eq(tasks.id, id));
    if (existing.length === 0) throw new Error('Tugas tidak ditemukan.');

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.name !== undefined) {
      const cleanName = input.name.trim();
      if (!cleanName) throw new Error('Nama tugas tidak boleh kosong.');
      updates.name = cleanName;
      updates.title = cleanName;
    }

    if (input.description !== undefined) {
      updates.description = input.description?.trim() || null;
    }

    if (input.priority !== undefined) {
      updates.priority = input.priority;
    }

    if (input.estimatedHours !== undefined) {
      const hours = Number(input.estimatedHours);
      if (isNaN(hours) || hours <= 0) {
        throw new Error('Estimasi waktu harus berupa angka lebih besar dari 0.');
      }
      updates.estimatedHours = hours;
      updates.estimatedMinutes = Math.round(hours * 60);
    }

    if (input.status !== undefined) {
      updates.status = input.status === 'DONE' ? 'COMPLETED' : input.status;
      updates.isCompleted = input.status === 'DONE' ? 1 : 0;
      updates.completedAt = input.status === 'DONE' ? new Date().toISOString() : null;
    }

    await db.update(tasks).set(updates).where(eq(tasks.id, id));

    const updated = await db.select().from(tasks).where(eq(tasks.id, id));
    const res = updated[0];

    let normStatus: TaskStatus = 'TODO';
    if (res.status === 'IN_PROGRESS') {
      normStatus = 'IN_PROGRESS';
    } else if (res.status === 'COMPLETED' || res.status === 'DONE' || res.isCompleted === 1) {
      normStatus = 'DONE';
    }

    return {
      id: res.id,
      stageId: res.stageId || '',
      name: res.name || res.title,
      description: res.description,
      priority: (res.priority as TaskPriority) || 'MEDIUM',
      estimatedHours: Number(res.estimatedHours || 1.0),
      status: normStatus,
      orderIndex: res.sortOrder || 0,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    };
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async setTaskStatus(id: string, status: TaskStatus): Promise<TaskItemEntity> {
    return this.updateTask(id, { status });
  }
}

export const stageRepository = new StageRepositoryImpl();
