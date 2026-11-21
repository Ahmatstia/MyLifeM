import { useEffect } from 'react';
import { useDeviceCalendar } from '@/shared/hooks/use-device-calendar';
import { syncCalendarReminders } from '../../data/services/calendar-reminder.service';

/** Mounted once after database readiness; renew the window on launch, resume and calendar changes. */
export function CalendarReminderSync() {
  const calendar = useDeviceCalendar();
  useEffect(() => { void syncCalendarReminders(); }, [calendar.key]);
  return null;
}
