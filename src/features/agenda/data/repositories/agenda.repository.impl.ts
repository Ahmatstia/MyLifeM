import { notifyTaskChanges } from '@/shared/data/task-changes';
import { writeTaskStatus } from '@/shared/data/task-status';
import { tasks, taskProfiles } from '@/db/schema';
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
  const linked = row.taskId ? db.select().from(tasks).where(eq(tasks.id,row.taskId)).get() : null;
  return {
    id: row.id,
    targetId: row.targetId,
    projectId: row.projectId,
    taskId: row.taskId,
    title: linked?.title ?? row.title,
    description: row.description,
    startTime: row.isAllDay ? allDayDates(row.startTime, row.endTime).start : parseInstant(row.startTime).toISOString(),
    endTime: row.isAllDay ? allDayDates(row.startTime, row.endTime).end : parseInstant(row.endTime).toISOString(),
    isAllDay: row.isAllDay === 1,
    eventType: row.eventType as AgendaEventEntity['eventType'],
    location: row.location,
    reminderMinutes: row.isAllDay ? null : row.reminderMinutes,
    isCompleted: linked ? ['COMPLETED','DONE'].includes(linked.status) : row.isCompleted === 1,
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
    return rows.filter(row=>!row.taskId||['TODO','IN_PROGRESS'].includes(db.select().from(tasks).where(eq(tasks.id,row.taskId)).get()?.status??'CANCELLED')).map(mapToAgendaEntity).filter(item=>!item.isCompleted);
  }

  async createEvent(input: CreateAgendaInput): Promise<AgendaEventEntity> {
    input = validateAgenda(input);
    const id = generateId();
    const now = new Date().toISOString();

    const newRow = {
      id,
      targetId: input.targetId || null,
      projectId: null,
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
    db.transaction(tx => {
      const event = tx.select().from(agendaEvents).where(eq(agendaEvents.id,id)).get();
      if (!event) throw new Error('Agenda tidak ditemukan.');
      if (event.taskId) writeTaskStatus(tx,event.taskId,isCompleted ? 'COMPLETED' : 'TODO',new Date().toISOString());
      else tx.update(agendaEvents).set({isCompleted:Number(isCompleted),updatedAt:new Date().toISOString()}).where(eq(agendaEvents.id,id)).run();
    });
  }

  async deleteEvent(id: string): Promise<void> {
    db.transaction(tx=>{const event=tx.select().from(agendaEvents).where(eq(agendaEvents.id,id)).get();
      tx.delete(agendaEvents).where(eq(agendaEvents.id,id)).run();
      if(event?.taskId && id==='task-block-legacy-'+event.taskId)tx.update(taskProfiles).set({executionDate:null,executionTime:null,alertMode:'NONE',snoozedUntilIso:null}).where(eq(taskProfiles.id,event.taskId)).run();
    });
    notifyTaskChanges();
  }
}

export const agendaRepository = new AgendaRepositoryImpl();
