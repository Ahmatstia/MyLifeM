/**
 * Weekly Schedule Domain Entity & Types
 * Represents master repeating schedules (KRS / Work Shifts) and their daily overrides.
 */

export type WeeklyScheduleType = 'COLLEGE' | 'WORK' | 'STUDY' | 'PERSONAL' | 'ROUTINE';

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

