import type {
  ProjectEntity,
  ProjectWithSummary,
  MilestoneEntity,
  CreateProjectInput,
  CreateMilestoneInput,
} from '../entities/project.entity';
import type { TaskEntity } from '@/features/today-focus/domain/entities/daily-focus.entity';

export interface ProjectFilterOptions {
  status?: string;
  targetId?: string;
}

export interface ProjectRepository {
  getProjects(filter?: ProjectFilterOptions): Promise<ProjectWithSummary[]>;
  getProjectById(id: string): Promise<ProjectWithSummary | null>;
  createProject(input: CreateProjectInput): Promise<ProjectEntity>;
  updateProject(id: string, updates: Partial<ProjectEntity>): Promise<void>;
  deleteProject(id: string): Promise<void>;

  getMilestones(projectId: string): Promise<MilestoneEntity[]>;
  createMilestone(input: CreateMilestoneInput): Promise<MilestoneEntity>;
  toggleMilestone(id: string, isCompleted: boolean): Promise<void>;
  deleteMilestone(id: string): Promise<void>;

  getProjectTasks(projectId: string): Promise<TaskEntity[]>;
  createProjectTask(projectId: string, title: string, milestoneId?: string | null): Promise<TaskEntity>;
  toggleProjectTask(taskId: string, isCompleted: boolean): Promise<void>;
  deleteProjectTask(taskId: string): Promise<void>;
}
