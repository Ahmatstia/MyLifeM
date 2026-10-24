import { eq, and, desc, sql, asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { agendaEvents, type AgendaEvent } from '@/db/schema';
import type {
  AgendaEventEntity,
  CreateAgendaInput,
} from '../../domain/entities/agenda.entity';
import type { AgendaRepository } from '../../domain/repositories/agenda.repository';

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

function mapToAgendaEntity(row: AgendaEvent): AgendaEventEntity {
  return {
    id: row.id,
    targetId: row.targetId,
    projectId: row.projectId,
    taskId: row.taskId,
    title: row.title,
    description: row.description,
    startTime: row.startTime,
    endTime: row.endTime,
    isAllDay: row.isAllDay === 1,
    eventType: row.eventType as AgendaEventEntity['eventType'],
    location: row.location,
    reminderMinutes: row.reminderMinutes ?? 10,
    isCompleted: row.isCompleted === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class AgendaRepositoryImpl implements AgendaRepository {
  async getEventsForDate(dateStr: string): Promise<AgendaEventEntity[]> {
    // Matches start of day to end of day in ISO strings
    const startOfDay = `${dateStr}T00:00:00.000Z`;
    const endOfDay = `${dateStr}T23:59:59.999Z`;

    const rows = await db
      .select()
      .from(agendaEvents)
      .where(
        sql`(${agendaEvents.startTime} >= ${startOfDay} AND ${agendaEvents.startTime} <= ${endOfDay})
            OR (${agendaEvents.isAllDay} = 1 AND ${agendaEvents.startTime} <= ${endOfDay} AND ${agendaEvents.endTime} >= ${startOfDay})`
      )
      .orderBy(desc(agendaEvents.isAllDay), asc(agendaEvents.startTime));

    return rows.map(mapToAgendaEntity);
  }

  async createEvent(input: CreateAgendaInput): Promise<AgendaEventEntity> {
    const id = generateId();
    const now = new Date().toISOString();

    const newRow = {
      id,
      targetId: input.targetId || null,
      projectId: input.projectId || null,
      taskId: null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      startTime: input.startTime,
      endTime: input.endTime,
      isAllDay: input.isAllDay ? 1 : 0,
      eventType: input.eventType || 'WORK',
      location: input.location?.trim() || null,
      reminderMinutes: input.reminderMinutes ?? 10,
      isCompleted: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(agendaEvents).values(newRow);
    const created = await db.select().from(agendaEvents).where(eq(agendaEvents.id, id));
    return mapToAgendaEntity(created[0]);
  }

  async toggleEventCompletion(id: string, isCompleted: boolean): Promise<void> {
    await db
      .update(agendaEvents)
      .set({
        isCompleted: isCompleted ? 1 : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(agendaEvents.id, id));
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(agendaEvents).where(eq(agendaEvents.id, id));
  }
}

export const agendaRepository = new AgendaRepositoryImpl();
