import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  weeklySchedules,
  weeklyScheduleLogs,
  type WeeklySchedule,
  type WeeklyScheduleLog,
} from '@/db/schema';
import { localTimeToIso } from '@/shared/utils/local-date';
import type {
  WeeklyScheduleEntity,
  CreateWeeklyScheduleInput,
  UpdateWeeklyScheduleInput,
  ProjectedWeeklyOccurrence,
} from '../../domain/entities/weekly-schedule.entity';
import { getDayOfWeekFromDate } from '../../domain/entities/weekly-schedule.entity';
import type { WeeklyScheduleRepository } from '../../domain/repositories/weekly-schedule.repository';

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

function mapToEntity(row: WeeklySchedule): WeeklyScheduleEntity {
  return {
    id: row.id,
    dayOfWeek: row.dayOfWeek,
    title: row.title,
    startTime: row.startTime,
    endTime: row.endTime,
    scheduleType: row.scheduleType as WeeklyScheduleEntity['scheduleType'],
    location: row.location,
    notes: row.notes,
    reminderMinutes: row.reminderMinutes,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class WeeklyScheduleRepositoryImpl implements WeeklyScheduleRepository {
  async getAllWeeklySchedules(): Promise<WeeklyScheduleEntity[]> {
    const rows = await db
      .select()
      .from(weeklySchedules)
      .orderBy(asc(weeklySchedules.dayOfWeek), asc(weeklySchedules.startTime));
    return rows.map(mapToEntity);
  }

  async getWeeklySchedulesByDay(dayOfWeek: number): Promise<WeeklyScheduleEntity[]> {
    const rows = await db
      .select()
      .from(weeklySchedules)
      .where(eq(weeklySchedules.dayOfWeek, dayOfWeek))
      .orderBy(asc(weeklySchedules.startTime));
    return rows.map(mapToEntity);
  }

  async getScheduleById(id: string): Promise<WeeklyScheduleEntity | null> {
    const rows = await db
      .select()
      .from(weeklySchedules)
      .where(eq(weeklySchedules.id, id))
      .limit(1);
    return rows.length > 0 ? mapToEntity(rows[0]) : null;
  }

  async createWeeklySchedule(input: CreateWeeklyScheduleInput): Promise<WeeklyScheduleEntity> {
    const title = input.title.trim();
    if (!title) throw new Error('Judul agenda tidak boleh kosong.');
    if (input.dayOfWeek < 1 || input.dayOfWeek > 7) throw new Error('Hari tidak valid (1-7).');
    if (!/^\d{2}:\d{2}$/.test(input.startTime) || !/^\d{2}:\d{2}$/.test(input.endTime)) {
      throw new Error('Format jam harus JJ:MM (misal 08:00).');
    }
    if (input.startTime >= input.endTime) {
      throw new Error('Jam mulai harus lebih awal dari jam selesai.');
    }

    const id = generateId();
    const now = new Date().toISOString();
    const newRow = {
      id,
      dayOfWeek: input.dayOfWeek,
      title,
      startTime: input.startTime,
      endTime: input.endTime,
      scheduleType: input.scheduleType || 'COLLEGE',
      location: input.location?.trim() || null,
      notes: input.notes?.trim() || null,
      reminderMinutes: input.reminderMinutes === undefined ? 15 : input.reminderMinutes,
      isActive: input.isActive === false ? 0 : 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(weeklySchedules).values(newRow);
    return mapToEntity(newRow);
  }

  async updateWeeklySchedule(
    id: string,
    input: UpdateWeeklyScheduleInput
  ): Promise<WeeklyScheduleEntity> {
    const existing = await this.getScheduleById(id);
    if (!existing) throw new Error('Jadwal tidak ditemukan.');

    const dayOfWeek = input.dayOfWeek ?? existing.dayOfWeek;
    const title = input.title !== undefined ? input.title.trim() : existing.title;
    const startTime = input.startTime ?? existing.startTime;
    const endTime = input.endTime ?? existing.endTime;
    const scheduleType = input.scheduleType ?? existing.scheduleType;
    const location = input.location !== undefined ? input.location?.trim() || null : existing.location;
    const notes = input.notes !== undefined ? input.notes?.trim() || null : existing.notes;
    const reminderMinutes = input.reminderMinutes !== undefined ? input.reminderMinutes : existing.reminderMinutes;
    const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);

    if (!title) throw new Error('Judul agenda tidak boleh kosong.');
    if (dayOfWeek < 1 || dayOfWeek > 7) throw new Error('Hari tidak valid (1-7).');
    if (startTime >= endTime) throw new Error('Jam mulai harus lebih awal dari jam selesai.');

    const now = new Date().toISOString();
    await db
      .update(weeklySchedules)
      .set({
        dayOfWeek,
        title,
        startTime,
        endTime,
        scheduleType,
        location,
        notes,
        reminderMinutes,
        isActive,
        updatedAt: now,
      })
      .where(eq(weeklySchedules.id, id));

    const updated = await this.getScheduleById(id);
    return updated!;
  }

  async deleteWeeklySchedule(id: string): Promise<void> {
    await db.delete(weeklySchedules).where(eq(weeklySchedules.id, id));
  }

  async getProjectedSchedulesForDate(dateStr: string): Promise<ProjectedWeeklyOccurrence[]> {
    const dayOfWeek = getDayOfWeekFromDate(dateStr);

    // 1. Fetch active schedules for this day of week
    const schedules = await db
      .select()
      .from(weeklySchedules)
      .where(and(eq(weeklySchedules.dayOfWeek, dayOfWeek), eq(weeklySchedules.isActive, 1)))
      .orderBy(asc(weeklySchedules.startTime));

    if (schedules.length === 0) return [];

    // 2. Fetch logs for this date
    const logs = await db
      .select()
      .from(weeklyScheduleLogs)
      .where(eq(weeklyScheduleLogs.date, dateStr));

    const logMap = new Map<string, WeeklyScheduleLog>();
    for (const log of logs) {
      logMap.set(log.scheduleId, log);
    }

    // 3. Project occurrences
    return schedules.map((schedule) => {
      const log = logMap.get(schedule.id);
      const startIso = localTimeToIso(dateStr, schedule.startTime);
      const endIso = localTimeToIso(dateStr, schedule.endTime);

      return {
        schedule: mapToEntity(schedule),
        date: dateStr,
        startIso,
        endIso,
        isCompleted: log ? log.isCompleted === 1 : false,
        isCancelled: log ? log.isCancelled === 1 : false,
        completedAt: log ? log.completedAt : null,
      };
    });
  }

  async setOccurrenceCompletion(
    scheduleId: string,
    dateStr: string,
    isCompleted: boolean
  ): Promise<void> {
    const now = new Date().toISOString();
    const existing = await db
      .select()
      .from(weeklyScheduleLogs)
      .where(
        and(
          eq(weeklyScheduleLogs.scheduleId, scheduleId),
          eq(weeklyScheduleLogs.date, dateStr)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(weeklyScheduleLogs)
        .set({
          isCompleted: isCompleted ? 1 : 0,
          completedAt: isCompleted ? now : null,
        })
        .where(eq(weeklyScheduleLogs.id, existing[0].id));
    } else {
      await db.insert(weeklyScheduleLogs).values({
        id: generateId(),
        scheduleId,
        date: dateStr,
        isCompleted: isCompleted ? 1 : 0,
        isCancelled: 0,
        completedAt: isCompleted ? now : null,
        createdAt: now,
      });
    }
  }

  async setOccurrenceCancellation(
    scheduleId: string,
    dateStr: string,
    isCancelled: boolean
  ): Promise<void> {
    const now = new Date().toISOString();
    const existing = await db
      .select()
      .from(weeklyScheduleLogs)
      .where(
        and(
          eq(weeklyScheduleLogs.scheduleId, scheduleId),
          eq(weeklyScheduleLogs.date, dateStr)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(weeklyScheduleLogs)
        .set({
          isCancelled: isCancelled ? 1 : 0,
        })
        .where(eq(weeklyScheduleLogs.id, existing[0].id));
    } else {
      await db.insert(weeklyScheduleLogs).values({
        id: generateId(),
        scheduleId,
        date: dateStr,
        isCompleted: 0,
        isCancelled: isCancelled ? 1 : 0,
        completedAt: null,
        createdAt: now,
      });
    }
  }
}

export const weeklyScheduleRepository = new WeeklyScheduleRepositoryImpl();
