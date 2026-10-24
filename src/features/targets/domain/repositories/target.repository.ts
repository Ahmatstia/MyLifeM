import type {
  TargetEntity,
  LifePillarEntity,
  CreateTargetInput,
} from '../entities/target.entity';

export interface TargetFilterOptions {
  pillarId?: string;
  status?: string;
}

export interface TargetRepository {
  getPillars(): Promise<LifePillarEntity[]>;
  getTargets(filter?: TargetFilterOptions): Promise<TargetEntity[]>;
  getTargetById(id: string): Promise<TargetEntity | null>;
  createTarget(input: CreateTargetInput): Promise<TargetEntity>;
  updateTarget(id: string, updates: Partial<TargetEntity>): Promise<void>;
  updateTargetProgress(id: string, currentValue: number): Promise<void>;
  deleteTarget(id: string): Promise<void>;
}
