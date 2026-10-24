import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { lifePillars, targets, type Target, type LifePillar } from '@/db/schema';
import type {
  TargetEntity,
  LifePillarEntity,
  CreateTargetInput,
} from '../../domain/entities/target.entity';
import type {
  TargetRepository,
  TargetFilterOptions,
} from '../../domain/repositories/target.repository';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function mapToTargetEntity(row: Target): TargetEntity {
  return {
    id: row.id,
    pillarId: row.pillarId,
    title: row.title,
    description: row.description,
    type: row.type as TargetEntity['type'],
    targetValue: row.targetValue,
    currentValue: row.currentValue,
    unit: row.unit,
    status: row.status as TargetEntity['status'],
    priority: row.priority as TargetEntity['priority'],
    startDate: row.startDate,
    targetDate: row.targetDate,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapToPillarEntity(row: LifePillar): LifePillarEntity {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sortOrder,
  };
}

export class TargetRepositoryImpl implements TargetRepository {
  async getPillars(): Promise<LifePillarEntity[]> {
    const rows = await db.select().from(lifePillars).orderBy(lifePillars.sortOrder);
    return rows.map(mapToPillarEntity);
  }

  async getTargets(filter?: TargetFilterOptions): Promise<TargetEntity[]> {
    const conditions = [];
    if (filter?.pillarId) {
      conditions.push(eq(targets.pillarId, filter.pillarId));
    }
    if (filter?.status) {
      conditions.push(eq(targets.status, filter.status));
    }

    let rows: Target[];
    if (conditions.length > 0) {
      rows = await db
        .select()
        .from(targets)
        .where(and(...conditions))
        .orderBy(desc(targets.updatedAt));
    } else {
      rows = await db.select().from(targets).orderBy(desc(targets.updatedAt));
    }

    return rows.map(mapToTargetEntity);
  }

  async getTargetById(id: string): Promise<TargetEntity | null> {
    const rows = await db.select().from(targets).where(eq(targets.id, id));
    if (rows.length === 0) return null;
    return mapToTargetEntity(rows[0]);
  }

  async createTarget(input: CreateTargetInput): Promise<TargetEntity> {
    const now = new Date().toISOString();
    const id = generateId();

    const newRow = {
      id,
      pillarId: input.pillarId,
      title: input.title,
      description: input.description || null,
      type: input.type,
      targetValue: input.targetValue,
      currentValue: input.currentValue ?? 0,
      unit: input.unit || '%',
      status: 'ACTIVE',
      priority: input.priority || 'MEDIUM',
      startDate: now,
      targetDate: input.targetDate || null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(targets).values(newRow);
    const created = await this.getTargetById(id);
    return created!;
  }

  async updateTarget(id: string, updates: Partial<TargetEntity>): Promise<void> {
    await db
      .update(targets)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(targets.id, id));
  }

  async updateTargetProgress(id: string, currentValue: number): Promise<void> {
    const target = await this.getTargetById(id);
    if (!target) return;

    const isComplete = currentValue >= target.targetValue;
    const now = new Date().toISOString();

    await db
      .update(targets)
      .set({
        currentValue,
        status: isComplete ? 'COMPLETED' : target.status,
        completedAt: isComplete ? now : null,
        updatedAt: now,
      })
      .where(eq(targets.id, id));
  }

  async deleteTarget(id: string): Promise<void> {
    await db.delete(targets).where(eq(targets.id, id));
  }
}

export const targetRepository = new TargetRepositoryImpl();
