/**
 * Stage and Task Domain Entities
 * Strictly follows MYLIFE_MOBILE_PRD_MVP.md specifications.
 */

export type StageParentType = 'TARGET' | 'PROJECT';
export type StageStatus = 'NO_TASKS' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

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
  if (tasks.length === 0) return 'NO_TASKS';

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
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
      return 'Belum ada tugas';
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
  const totalTasks = allTasks.length;
  if (totalTasks === 0) {
    return { percent: 0, completedTasks: 0, totalTasks: 0, totalHours: 0 };
  }

  const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
  const percent = Math.min(100, Math.max(0, Math.round((completedTasks / totalTasks) * 100)));
  const totalHours = Math.round(allTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0) * 10) / 10;

  return {
    percent,
    completedTasks,
    totalTasks,
    totalHours,
  };
}
