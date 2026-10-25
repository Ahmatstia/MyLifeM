/**
 * Target Domain Entity & Invariants
 * Strictly aligns with MYLIFE_MOBILE_PRD_MVP.md.
 */

export type TargetStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type TargetPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LifePillarEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface TargetEntity {
  id: string;
  categoryId: string;
  categoryName: string;
  pillarId?: string | null;
  title: string;
  description: string | null;
  status: TargetStatus;
  priority: TargetPriority;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  totalEstimatedHours: number;
  startDate: string;
  targetDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTargetInput {
  categoryId: string;
  title: string;
  description?: string;
  pillarId?: string;
  priority?: TargetPriority;
}

export interface UpdateTargetInput {
  categoryId?: string;
  title?: string;
  description?: string;
  priority?: TargetPriority;
}

/**
 * PRD 8: Target Progress Calculation
 * Progres (%) = (Jumlah tugas berstatus Selesai / Jumlah seluruh tugas) × 100
 */
export function calculateTargetProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks <= 0) return 0;
  const percentage = (completedTasks / totalTasks) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100);
}
