import { eq, sql } from 'drizzle-orm';
import { localDayBounds, parseInstant } from '@/shared/utils/local-date';
import { allDayDates, occursOnDate, validateAgenda } from '../../domain/agenda-time';
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
  if (!row.isAllDay && parseInstant(row.endTime) <= parseInstant(row.startTime)) throw new Error('Agenda ' + row.id + ' memiliki rentang waktu lama yang tidak valid. Catatan asli tidak diubah.');
  return {
    id: row.id,
    targetId: row.targetId,
    projectId: row.projectId,
    taskId: row.taskId,
    title: row.title,
    description: row.description,
    startTime: row.isAllDay ? allDayDates(row.startTime, row.endTime).start : parseInstant(row.startTime).toISOString(),
    endTime: row.isAllDay ? allDayDates(row.startTime, row.endTime).end : parseInstant(row.endTime).toISOString(),
    isAllDay: row.isAllDay === 1,
    eventType: row.eventType as AgendaEventEntity['eventType'],
    location: row.location,
    reminderMinutes: row.isAllDay ? null : row.reminderMinutes,
    isCompleted: row.isCompleted === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class AgendaRepositoryImpl implements AgendaRepository {
  async getEventsForDate(dateStr: string): Promise<AgendaEventEntity[]> {
    const { start, end } = localDayBounds(dateStr);
    // shortcut: mixed legacy timestamps require computed predicates; index normalization needs an explicit timezone migration.

    const rows = await db
      .select()
      .from(agendaEvents)
      .where(
        sql`(julianday(${agendaEvents.startTime}) < julianday(${end.toISOString()}) AND julianday(${agendaEvents.endTime}) > julianday(${start.toISOString()}))
          OR (substr(${agendaEvents.startTime},1,10) <= ${dateStr} AND substr(${agendaEvents.endTime},1,10) >= ${dateStr})`
      );

    // The calendar-date branch also includes offset-less legacy wall times and old all-day values.
    return rows.map(mapToAgendaEntity).filter(event => occursOnDate(event, dateStr)).sort((a, b) => Number(b.isAllDay) - Number(a.isAllDay) || a.startTime.localeCompare(b.startTime));
  }

  async getReminderEvents(): Promise<AgendaEventEntity[]> {
    const rows = await db.select().from(agendaEvents).where(sql`${agendaEvents.isCompleted} = 0 AND ${agendaEvents.isAllDay} = 0 AND ${agendaEvents.reminderMinutes} IS NOT NULL`);
    return rows.map(mapToAgendaEntity);
  }

  async createEvent(input: CreateAgendaInput): Promise<AgendaEventEntity> {
    input = validateAgenda(input);
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
      reminderMinutes: input.reminderMinutes === undefined ? 10 : input.reminderMinutes,
      isCompleted: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(agendaEvents).values(newRow);
    return mapToAgendaEntity(newRow);
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
