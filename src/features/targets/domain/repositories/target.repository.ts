import type {
  TargetEntity,
  LifePillarEntity,
  CreateTargetInput,
  UpdateTargetInput,
} from '../entities/target.entity';

export interface TargetFilterOptions {
  categoryId?: string;
  pillarId?: string;
  status?: string;
}

export interface TargetRepository {
  getPillars(): Promise<LifePillarEntity[]>;
  getTargets(filter?: TargetFilterOptions): Promise<TargetEntity[]>;
  getTargetById(id: string): Promise<TargetEntity | null>;
  createTarget(input: CreateTargetInput): Promise<TargetEntity>;
  updateTarget(id: string, updates: UpdateTargetInput): Promise<void>;
  deleteTarget(id: string): Promise<void>;
}
