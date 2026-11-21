/**
 * Weekly Schedule Domain Entity & Types
 * Represents weekly repeating schedules (Classes / Work Shifts) and their daily overrides.
 */

import { isTimeOnly } from '@/shared/utils/local-date';

export const WEEKLY_SCHEDULE_TYPES = ['COLLEGE', 'WORK', 'STUDY', 'PERSONAL', 'ROUTINE'] as const;
export type WeeklyScheduleType = typeof WEEKLY_SCHEDULE_TYPES[number];

export function validateWeeklySchedule(input: {
  title: unknown; dayOfWeek: unknown; startTime: unknown; endTime: unknown;
  scheduleType?: unknown; reminderMinutes?: unknown;
}): void {
  if (typeof input.title !== 'string' || !input.title.trim()) throw new Error('Judul agenda tidak boleh kosong.');
  if (typeof input.dayOfWeek !== 'number' || !Number.isInteger(input.dayOfWeek) || input.dayOfWeek < 1 || input.dayOfWeek > 7) throw new Error('Hari jadwal harus bilangan bulat 1–7.');
  if (!isTimeOnly(input.startTime) || !isTimeOnly(input.endTime)) throw new Error('Jam jadwal harus HH:mm antara 00:00 dan 23:59.');
  if (input.startTime >= input.endTime) throw new Error('Jam mulai harus lebih awal dari jam selesai.');
  if (input.scheduleType !== undefined && !WEEKLY_SCHEDULE_TYPES.some(type => type === input.scheduleType)) throw new Error('Jenis jadwal tidak dikenal.');
  if (input.reminderMinutes !== undefined && input.reminderMinutes !== null
    && (typeof input.reminderMinutes !== 'number' || !Number.isSafeInteger(input.reminderMinutes) || input.reminderMinutes < 0)) throw new Error('Pengingat harus berupa menit tidak negatif.');
}

export function isDailyRoutine(scheduleType: WeeklyScheduleType): boolean {
  return scheduleType === 'ROUTINE';
}

export function isCommitment(scheduleType: WeeklyScheduleType): boolean {
  return scheduleType !== 'ROUTINE';
}

export interface WeeklyScheduleEntity {
  id: string;
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, ..., 7 = Minggu
  title: string;
  startTime: string; // 'HH:mm', misal '08:00'
  endTime: string;   // 'HH:mm', misal '10:00'
  scheduleType: WeeklyScheduleType;
  location: string | null;
  notes: string | null;
  reminderMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyScheduleLogEntity {
  id: string;
  scheduleId: string;
  date: string; // 'YYYY-MM-DD'
  isCompleted: boolean;
  isCancelled: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateWeeklyScheduleInput {
  dayOfWeek: number; // 1-7
  title: string;
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  scheduleType?: WeeklyScheduleType;
  location?: string | null;
  notes?: string | null;
  reminderMinutes?: number | null;
  isActive?: boolean;
}

export interface UpdateWeeklyScheduleInput {
  dayOfWeek?: number;
  title?: string;
  startTime?: string;
  endTime?: string;
  scheduleType?: WeeklyScheduleType;
  location?: string | null;
  notes?: string | null;
  reminderMinutes?: number | null;
  isActive?: boolean;
}

/**
 * Projected occurrence of a master weekly schedule on a specific date.
 */
export interface ProjectedWeeklyOccurrence {
  schedule: WeeklyScheduleEntity;
  date: string;       // 'YYYY-MM-DD'
  startIso: string;   // ISO-8601 UTC timestamp
  endIso: string;     // ISO-8601 UTC timestamp
  isCompleted: boolean;
  isCancelled: boolean;
  completedAt: string | null;
}

export const DAY_NAMES: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

export const DAY_SHORT_NAMES: Record<number, string> = {
  1: 'Sen',
  2: 'Sel',
  3: 'Rab',
  4: 'Kam',
  5: 'Jum',
  6: 'Sab',
  7: 'Min',
};

/**
 * Convert local date string 'YYYY-MM-DD' to day of week (1 = Senin, ..., 7 = Minggu).
 */
export function getDayOfWeekFromDate(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const jsDay = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  return jsDay === 0 ? 7 : jsDay;
}

