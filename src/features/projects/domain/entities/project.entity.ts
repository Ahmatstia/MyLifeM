/**
 * Project Domain Entities
 * Strictly follows MYLIFE_MOBILE_PRD_MVP.md.
 */

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface MilestoneEntity {
  id: string;
  projectId: string;
  title: string;
  sortOrder: number;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface ProjectEntity {
  id: string;
  targetId: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  targetDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskSummary {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  totalEstimatedHours: number;
}

export interface ProjectWithSummary extends ProjectEntity {
  targetTitle?: string | null;
  milestonesCount: number;
  stagesCount: number;
  taskSummary: ProjectTaskSummary;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  targetId?: string | null;
  priority?: ProjectPriority;
  targetDate?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  priority?: ProjectPriority;
  status?: ProjectStatus;
}

export interface CreateMilestoneInput {
  projectId: string;
  title: string;
  sortOrder?: number;
  dueDate?: string | null;
}

/**
 * PRD 8: Calculate project progress percentage based on task completion
 */
export function calculateProjectProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks <= 0) return 0;
  const percentage = (completedTasks / totalTasks) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100);
}
