import { normalizeTaskStatus, summarizeTasks } from '@/shared/domain/task-status';
import { writeTaskStatus } from '@/shared/data/task-status';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  projects,
  targets,
  milestones,
  stages,
  tasks,
  type Project,
  type Milestone,
  type Task,
} from '@/db/schema';
import {
  type ProjectEntity,
  type ProjectWithSummary,
  type MilestoneEntity,
  type CreateProjectInput,
  type CreateMilestoneInput,
} from '../../domain/entities/project.entity';
import type { TaskEntity } from '@/features/today-focus/domain/entities/daily-focus.entity';
import type {
  ProjectRepository,
  ProjectFilterOptions,
} from '../../domain/repositories/project.repository';

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

function mapToProjectEntity(row: Project): ProjectEntity {
  return {
    id: row.id,
    targetId: row.targetId,
    title: row.title,
    description: row.description,
    status: row.status as ProjectEntity['status'],
    priority: row.priority as ProjectEntity['priority'],
    targetDate: row.targetDate,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapToMilestoneEntity(row: Milestone): MilestoneEntity {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    sortOrder: row.sortOrder,
    isCompleted: row.isCompleted === 1,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
  };
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
    status: normalizeTaskStatus(row.status),
    estimatedMinutes: row.estimatedMinutes,
    actualMinutes: row.actualMinutes,
    dueDate: row.dueDate,
    isCompleted: normalizeTaskStatus(row.status) === 'COMPLETED',
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class ProjectRepositoryImpl implements ProjectRepository {
  async getProjects(filter?: ProjectFilterOptions): Promise<ProjectWithSummary[]> {
    const conditions = [];
    if (filter?.status) {
      conditions.push(eq(projects.status, filter.status));
    }
    if (filter?.targetId) {
      conditions.push(eq(projects.targetId, filter.targetId));
    }

    let projectRows: Project[];
    if (conditions.length > 0) {
      projectRows = await db
        .select()
        .from(projects)
        .where(and(...conditions))
        .orderBy(desc(projects.updatedAt));
    } else {
      projectRows = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    }

    const allProjectStages = await db
      .select()
      .from(stages)
      .where(eq(stages.parentType, 'PROJECT'));

    const allTasks = await db.select().from(tasks);

    const result: ProjectWithSummary[] = [];

    for (const p of projectRows) {
      // Get target title if linked
      let targetTitle: string | null = null;
      if (p.targetId) {
        const targetRow = await db
          .select({ title: targets.title })
          .from(targets)
          .where(eq(targets.id, p.targetId));
        if (targetRow.length > 0) {
          targetTitle = targetRow[0].title;
        }
      }

      // Count milestones & stages
      const pStages = allProjectStages.filter((s) => s.parentId === p.id);
      const stageIds = pStages.map((s) => s.id);

      const milestoneRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(milestones)
        .where(eq(milestones.projectId, p.id));
      const milestonesCount = milestoneRows[0]?.count || 0;

      // Count tasks & completion (both from stageIds and direct projectId)
      const projectTasks = allTasks.filter((t) => {
        if (t.stageId && stageIds.includes(t.stageId)) return true;
        if (t.projectId === p.id) return true;
        return false;
      });

      const taskSummary = summarizeTasks(projectTasks);

      result.push({
        ...mapToProjectEntity(p),
        targetTitle,
        milestonesCount,
        stagesCount: pStages.length,
        taskSummary,
      });
    }

    return result;
  }

  async getProjectById(id: string): Promise<ProjectWithSummary | null> {
    const list = await this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  async createProject(input: CreateProjectInput): Promise<ProjectEntity> {
    const cleanTitle = input.title.trim();
    if (!cleanTitle) {
      throw new Error('Nama proyek wajib diisi.');
    }

    const id = generateId();
    const now = new Date().toISOString();

    const newRow = {
      id,
      targetId: input.targetId || null,
      title: cleanTitle,
      description: input.description?.trim() || null,
      status: 'ACTIVE',
      priority: input.priority || 'MEDIUM',
      targetDate: input.targetDate || null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(projects).values(newRow);
    const created = await db.select().from(projects).where(eq(projects.id, id));
    return mapToProjectEntity(created[0]);
  }

  async updateProject(id: string, updates: Partial<ProjectEntity>): Promise<void> {
    await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, id));
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getMilestones(projectId: string): Promise<MilestoneEntity[]> {
    const rows = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(milestones.sortOrder);

    return rows.map(mapToMilestoneEntity);
  }

  async createMilestone(input: CreateMilestoneInput): Promise<MilestoneEntity> {
    const id = generateId();
    const now = new Date().toISOString();

    const newRow = {
      id,
      projectId: input.projectId,
      title: input.title.trim(),
      sortOrder: input.sortOrder ?? 0,
      isCompleted: 0,
      dueDate: input.dueDate || null,
      createdAt: now,
    };

    await db.insert(milestones).values(newRow);
    const created = await db.select().from(milestones).where(eq(milestones.id, id));
    return mapToMilestoneEntity(created[0]);
  }

  async toggleMilestone(id: string, isCompleted: boolean): Promise<void> {
    await db
      .update(milestones)
      .set({
        isCompleted: isCompleted ? 1 : 0,
      })
      .where(eq(milestones.id, id));
  }

  async deleteMilestone(id: string): Promise<void> {
    await db.delete(milestones).where(eq(milestones.id, id));
  }

  async getProjectTasks(projectId: string): Promise<TaskEntity[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(sql`CASE WHEN ${tasks.status} IN ('COMPLETED','DONE') THEN 1 WHEN ${tasks.status} = 'CANCELLED' THEN 2 ELSE 0 END`, desc(tasks.createdAt));

    return rows.map(mapToTaskEntity);
  }

  async createProjectTask(
    projectId: string,
    title: string,
    milestoneId?: string | null
  ): Promise<TaskEntity> {
    const id = generateId();
    const now = new Date().toISOString();

    const newRow = {
      id,
      projectId,
      targetId: null,
      milestoneId: milestoneId || null,
      title: title.trim(),
      name: title.trim(),
      description: null,
      priority: 'MEDIUM' as const,
      status: 'TODO' as const,
      estimatedMinutes: 25,
      actualMinutes: 0,
      dueDate: null,
      isCompleted: 0,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tasks).values(newRow);
    const created = await db.select().from(tasks).where(eq(tasks.id, id));
    return mapToTaskEntity(created[0]);
  }

  async toggleProjectTask(taskId: string, isCompleted: boolean): Promise<void> {
    db.transaction(tx => writeTaskStatus(tx, taskId, isCompleted ? 'COMPLETED' : 'TODO', new Date().toISOString()));
  }

  async deleteProjectTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }
}

export const projectRepository = new ProjectRepositoryImpl();
