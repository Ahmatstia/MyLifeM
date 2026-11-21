import { formatLocalDate, localTimeToIso, shiftDate } from '@/shared/utils/local-date';
import { getDayOfWeekFromDate, validateWeeklySchedule, type WeeklyScheduleEntity } from './entities/weekly-schedule.entity';

export const WEEKLY_REMINDER_DAYS = 28;
export interface CalendarReminder {
  id: string; title: string; startTime: string; reminderMinutes: number | null;
  isAllDay: boolean | number; isCompleted: boolean | number; kind?: 'agenda' | 'weekly';
}
interface ReminderLog { scheduleId: string; date: string; isCompleted: boolean | number; isCancelled: boolean | number; }

/** Expand by delivery date, including reminders that cross midnight or have long lead times. */
export function projectWeeklyReminders(schedules: WeeklyScheduleEntity[], logs: ReminderLog[], now = new Date()): CalendarReminder[] {
  const horizon = new Date(now); horizon.setDate(horizon.getDate() + WEEKLY_REMINDER_DAYS);
  const excluded = new Set(logs.filter(log => log.isCompleted || log.isCancelled).map(log => log.scheduleId + '|' + log.date));
  const events: CalendarReminder[] = [];
  for (const schedule of schedules) {
    if (!schedule.isActive || schedule.reminderMinutes === null) continue;
    validateWeeklySchedule(schedule);
    const lead = schedule.reminderMinutes * 60_000;
    const first = new Date(now.getTime() + lead), last = new Date(horizon.getTime() + lead);
    if (!Number.isSafeInteger(lead) || !Number.isFinite(first.getTime()) || !Number.isFinite(last.getTime())) throw new Error('Jarak pengingat jadwal rutin terlalu besar.');
    const finalDate = formatLocalDate(last);
    for (let date = formatLocalDate(first); date <= finalDate; date = shiftDate(date, 1)) {
      if (getDayOfWeekFromDate(date) !== schedule.dayOfWeek || excluded.has(schedule.id + '|' + date)) continue;
      const startTime = localTimeToIso(date, schedule.startTime), trigger = Date.parse(startTime) - lead;
      if (trigger <= now.getTime() || trigger > horizon.getTime()) continue;
      events.push({ id: schedule.id + '|' + date, title: schedule.title, startTime,
        reminderMinutes: schedule.reminderMinutes, kind: 'weekly', isAllDay: false, isCompleted: false });
    }
  }
  return events.sort((a, b) => Date.parse(a.startTime) - Number(a.reminderMinutes) * 60_000 - (Date.parse(b.startTime) - Number(b.reminderMinutes) * 60_000));
}
