import { summarizeTasks } from '@/shared/domain/task-status';
import type { TaskStatus } from '@/shared/domain/task-status';
export type { TaskStatus } from '@/shared/domain/task-status';
/**
 * Stage and Task Domain Entities
 * Strictly follows MYLIFE_MOBILE_PRD_MVP.md specifications.
 */

export type StageParentType = 'TARGET' | 'PROJECT';
export type StageStatus = 'NO_TASKS' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';


export interface TaskItemEntity {
  id: string;
  stageId: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  estimatedHours: number;
  status: TaskStatus;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface StageEntity {
  id: string;
  parentType: StageParentType;
  parentId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StageWithTasks extends StageEntity {
  tasks: TaskItemEntity[];
  status: StageStatus;
  totalTasks: number;
  completedTasks: number;
  totalEstimatedHours: number;
}

export interface CreateStageInput {
  parentType: StageParentType;
  parentId: string;
  name: string;
  description?: string;
}

export interface UpdateStageInput {
  name: string;
  description?: string;
}

export interface CreateTaskInput {
  stageId: string;
  name: string;
  description?: string;
  priority?: TaskPriority;
  estimatedHours?: number;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  priority?: TaskPriority;
  estimatedHours?: number;
  status?: TaskStatus;
}

/**
 * PRD 8: Status Tahapan Calculation
 * - Belum ada tugas: total tugas = 0.
 * - Belum dimulai: ada tugas, tetapi belum ada tugas yang selesai atau sedang dikerjakan.
 * - Berjalan: minimal satu tugas sedang dikerjakan atau ada kombinasi tugas selesai dan belum selesai.
 * - Selesai: semua tugas pada tahapan tersebut berstatus selesai dan jumlah tugas lebih dari 0.
 */
export function calculateStageStatus(tasks: TaskItemEntity[]): StageStatus {
  tasks = tasks.filter(task => task.status !== 'CANCELLED');
  if (tasks.length === 0) return 'NO_TASKS';

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  if (completedCount === tasks.length) return 'COMPLETED';
  if (completedCount === 0 && inProgressCount === 0) return 'NOT_STARTED';
  return 'IN_PROGRESS';
}

/**
 * Human-readable label in Bahasa Indonesia
 */
export function getStageStatusLabel(status: StageStatus): string {
  switch (status) {
    case 'NO_TASKS':
      return 'Belum ada tugas aktif';
    case 'NOT_STARTED':
      return 'Belum dimulai';
    case 'IN_PROGRESS':
      return 'Berjalan';
    case 'COMPLETED':
      return 'Selesai';
  }
}

/**
 * PRD 8: Progres Target dan Project
 * Progres (%) = (Jumlah tugas berstatus Selesai / Jumlah seluruh tugas) × 100
 */
export function calculateOverallProgress(allTasks: TaskItemEntity[]): {
  percent: number;
  completedTasks: number;
  totalTasks: number;
  totalHours: number;
} {
  const summary = summarizeTasks(allTasks);
  return { percent: summary.progressPercent, completedTasks: summary.completedTasks, totalTasks: summary.totalTasks, totalHours: summary.totalEstimatedHours };
}
