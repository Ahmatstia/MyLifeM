import { summarizeTasks } from '@/shared/domain/task-status';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../client';
import {
  projects,
  milestones,
  tasks,
  type Project,
  type NewProject,
  type Milestone,
  type NewMilestone,
} from '../schema';

export const projectRepo = {
  async getProjects(filter?: { targetId?: string; status?: string }): Promise<Project[]> {
    const conditions = [];
    if (filter?.targetId) {
      conditions.push(eq(projects.targetId, filter.targetId));
    }
    if (filter?.status) {
      conditions.push(eq(projects.status, filter.status));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(projects)
        .where(and(...conditions))
        .orderBy(desc(projects.updatedAt));
    }

    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  },

  async getProjectById(id: string): Promise<Project | undefined> {
    const rows = await db.select().from(projects).where(eq(projects.id, id));
    return rows[0];
  },

  async createProject(data: NewProject): Promise<Project> {
    const now = new Date().toISOString();
    const newProject: NewProject = {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    await db.insert(projects).values(newProject);
    return (await this.getProjectById(newProject.id))!;
  },

  async updateProject(id: string, updates: Partial<NewProject>): Promise<void> {
    await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, id));
  },

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  },

  async getMilestones(projectId: string): Promise<Milestone[]> {
    return await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(milestones.sortOrder);
  },

  async createMilestone(data: NewMilestone): Promise<void> {
    await db.insert(milestones).values({
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    });
  },

  async toggleMilestone(id: string, isCompleted: boolean): Promise<void> {
    await db
      .update(milestones)
      .set({ isCompleted: isCompleted ? 1 : 0 })
      .where(eq(milestones.id, id));
  },

  async deleteMilestone(id: string): Promise<void> {
    await db.delete(milestones).where(eq(milestones.id, id));
  },

  async getProjectDetails(id: string) {
    const project = await this.getProjectById(id);
    if (!project) return null;

    const projectMilestones = await this.getMilestones(id);
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, id));

    const { totalTasks, completedTasks, progressPercent } = summarizeTasks(projectTasks);

    return {
      project,
      milestones: projectMilestones,
      tasks: projectTasks,
      stats: {
        totalTasks,
        completedTasks,
        progressPercent,
      },
    };
  },
};
