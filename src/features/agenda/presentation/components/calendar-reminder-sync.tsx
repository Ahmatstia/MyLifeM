import { router } from 'expo-router';
import { AgendaNotificationService } from '../../data/services/agenda-notification.service';
import { useEffect } from 'react';
import { useDeviceCalendar } from '@/shared/hooks/use-device-calendar';
import { subscribeTaskAlarmStatus } from '@/features/task-manager/data/services/task-alarm-notification.service';
import { useNotificationStore } from '@/shared/notifications/notification-store';
import { syncCalendarReminders, subscribeCalendarReminderStatus } from '../../data/services/calendar-reminder.service';

/** Mounted once after database readiness; renew the window on launch, resume and calendar changes. */
export function CalendarReminderSync() {
  const calendar = useDeviceCalendar();
  useEffect(() => AgendaNotificationService.observeResponses((taskId,date) => {
    if(taskId)router.push({pathname:'/tasks/[id]',params:{id:taskId}});
    else router.push({pathname:'/(tabs)/agenda',params:date?{date}:{}});
  }), []);
  useEffect(() => {
    const publish = useNotificationStore.getState().publish;
    const calendarStatus = subscribeCalendarReminderStatus(message => publish(message ? {
      id: 'calendar-reminders', title: 'Periksa pengingat kalender', message, kind: 'calendar',
    } : null, 'calendar-reminders'));
    const taskStatus = subscribeTaskAlarmStatus(message => publish(message ? {
      id: 'task-reminders', title: 'Periksa pengingat tugas', message, kind: 'tasks',
    } : null, 'task-reminders'));
    return () => { calendarStatus(); taskStatus(); };
  }, []);
  useEffect(() => { void syncCalendarReminders(); }, [calendar.key]);
  return null;
}
