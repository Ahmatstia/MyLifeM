import { useEffect } from 'react';
import { router } from 'expo-router';
import { useDeviceCalendar } from '@/shared/hooks/use-device-calendar';
import { managedTaskRepository } from '../../data/repositories/managed-task.repository';
import { TaskAlarmNotificationService } from '../../data/services/task-alarm-notification.service';
import { syncCalendarReminders } from '@/features/agenda/data/services/calendar-reminder.service';

/** The root mounts this only after the database is ready, including after a restore. */
export function ManagedAlarmSync() {
  const calendar = useDeviceCalendar();
  useEffect(() => {
    let alive = true;
    void managedTaskRepository.syncAlarms().then(async () => {
      if (!alive) return;
      await syncCalendarReminders();
      if (alive) await managedTaskRepository.checkDueAlarmsNow();
    }).catch(error => { console.warn('[ManagedAlarmSync] Pengingat belum dapat diperbarui:', error); });
    return () => { alive = false; };
  }, [calendar.key]);
  useEffect(() => TaskAlarmNotificationService.observeResponses(async response => {
    if (!response.isAlarm || !await managedTaskRepository.openAlarmFromNotification(response.taskId, response.occurrence)) {
      router.push('/task-manager');
    }
  }), []);
  return null;
}
