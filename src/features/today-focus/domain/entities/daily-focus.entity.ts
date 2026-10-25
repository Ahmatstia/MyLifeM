/**
 * Today & Focus Domain Entities
 * Pure domain models and timer state representations.
 */

export type FocusTimerMode = 'POMODORO' | 'DEEP_FLOW' | 'STOPWATCH';

export interface FocusTimerConfig {
  mode: FocusTimerMode;
  durationMinutes: number; // 25 for pomodoro, 50 or 90 for deep flow, 0 for stopwatch
}

export const TIMER_PRESETS: Record<FocusTimerMode, number[]> = {
  POMODORO: [25, 50],
  DEEP_FLOW: [50, 90],
  STOPWATCH: [0],
};

export interface TaskEntity {
  id: string;
  projectId: string | null;
  targetId: string | null;
  milestoneId: string | null;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyFocusItemEntity {
  id: string;
  date: string; // YYYY-MM-DD
  taskId: string;
  sortOrder: number;
  isCompleted: boolean;
  createdAt: string;
  task: TaskEntity;
}

export interface FocusSessionEntity {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  mode: FocusTimerMode;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  rating: number | null; // 1 to 5 stars
  obstacle: string | null;
  nextAction: string | null;
  createdAt: string;
}

export interface SaveSessionInput {
  taskId?: string | null;
  mode: FocusTimerMode;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  rating?: number | null;
  obstacle?: string | null;
  nextAction?: string | null;
}
