/**
 * Target Domain Entity & Invariants
 * Pure business logic with zero framework or database dependencies.
 */

export type TargetType = 'MILESTONE_BASED' | 'NUMERIC' | 'MAINTENANCE';
export type TargetStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type TargetPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface LifePillarEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface TargetEntity {
  id: string;
  pillarId: string;
  title: string;
  description: string | null;
  type: TargetType;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: TargetStatus;
  priority: TargetPriority;
  startDate: string;
  targetDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTargetInput {
  pillarId: string;
  title: string;
  description?: string;
  type: TargetType;
  targetValue: number;
  currentValue?: number;
  unit: string;
  priority?: TargetPriority;
  targetDate?: string;
}

/**
 * Domain Calculation: Calculate percentage progress (0 - 100)
 */
export function calculateTargetProgress(target: Pick<TargetEntity, 'type' | 'targetValue' | 'currentValue' | 'status'>): number {
  if (target.status === 'COMPLETED') return 100;
  if (target.targetValue <= 0) return 0;
  
  const percentage = (target.currentValue / target.targetValue) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100);
}
