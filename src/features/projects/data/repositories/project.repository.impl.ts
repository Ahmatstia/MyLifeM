import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  projects,
  targets,
  milestones,
  tasks,
  type Project,
  type Milestone,
  type Task,
} from '@/db/schema';
import {
  calculateProjectProgress,
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

      // Count milestones
      const milestoneRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(milestones)
        .where(eq(milestones.projectId, p.id));
      const milestonesCount = milestoneRows[0]?.count || 0;

      // Count tasks & completion
      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, p.id));

      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.isCompleted === 1).length;
      const progressPercent = calculateProjectProgress(completedTasks, totalTasks);

      result.push({
        ...mapToProjectEntity(p),
        targetTitle,
        milestonesCount,
        taskSummary: {
          totalTasks,
          completedTasks,
          progressPercent,
        },
      });
    }

    return result;
  }

  async getProjectById(id: string): Promise<ProjectWithSummary | null> {
    const rows = await db.select().from(projects).where(eq(projects.id, id));
    if (rows.length === 0) return null;

    const p = rows[0];

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

    const milestoneRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(milestones)
      .where(eq(milestones.projectId, p.id));
    const milestonesCount = milestoneRows[0]?.count || 0;

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, p.id));

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.isCompleted === 1).length;
    const progressPercent = calculateProjectProgress(completedTasks, totalTasks);

    return {
      ...mapToProjectEntity(p),
      targetTitle,
      milestonesCount,
      taskSummary: {
        totalTasks,
        completedTasks,
        progressPercent,
      },
    };
  }

  async createProject(input: CreateProjectInput): Promise<ProjectEntity> {
    const id = generateId();
    const now = new Date().toISOString();

    const newRow = {
      id,
      targetId: input.targetId || null,
      title: input.title.trim(),
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
      .orderBy(tasks.isCompleted, desc(tasks.createdAt));

    return rows.map(mapToTaskEntity);
  }

  async createProjectTask(
    projectId: string,
    title: string,
    milestoneId?: string | null
  ): Promise<TaskEntity> {
    const id = generateId();
    const now = new Date().toISOString();

    // Check project targetId so task inherits target link
    const projRows = await db.select({ targetId: projects.targetId }).from(projects).where(eq(projects.id, projectId));
    const targetId = projRows[0]?.targetId || null;

    const newRow = {
      id,
      projectId,
      targetId,
      milestoneId: milestoneId || null,
      title: title.trim(),
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
    const now = new Date().toISOString();
    await db
      .update(tasks)
      .set({
        isCompleted: isCompleted ? 1 : 0,
        status: isCompleted ? 'COMPLETED' : 'TODO',
        completedAt: isCompleted ? now : null,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));
  }

  async deleteProjectTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }
}

export const projectRepository = new ProjectRepositoryImpl();
