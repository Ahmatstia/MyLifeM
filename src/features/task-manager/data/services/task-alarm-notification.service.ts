import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import type { ManagedTaskEntity } from '../../domain/entities/managed-task.entity';

let notificationsModule: typeof import('expo-notifications') | null = null;
let isLoaded = false;

function getNotifications() {
  if (isLoaded) return notificationsModule;
  isLoaded = true;
  if (Platform.OS === 'web') return null;
  try {
    if (
      Platform.OS === 'android' &&
      !requireOptionalNativeModule('ExpoTopicSubscriptionModule')
    ) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: typeof import('expo-notifications') = require('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    notificationsModule = mod;
  } catch {
    // Ignore on unsupported runtimes
  }
  return notificationsModule;
}

function toLocalEpochMs(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(
    y || 2026,
    (m || 1) - 1,
    d || 1,
    hh || 0,
    mm || 0,
    0,
    0
  );
  return dt.getTime();
}

export class TaskAlarmNotificationService {
  static async ensureChannelsAndPermissions(askUser = true): Promise<boolean> {
    const notifications = getNotifications();
    if (!notifications) return false;

    try {
      if (Platform.OS === 'android') {
        await notifications.setNotificationChannelAsync('task-alarm-loud', {
          name: 'Alarm Tugas & Eksekusi (Prioritas Maksimal)',
          importance: notifications.AndroidImportance.MAX,
          bypassDnd: true,
          enableVibrate: true,
          vibrationPattern: [0, 600, 250, 600, 250, 900],
          sound: 'default',
        });

        await notifications.setNotificationChannelAsync('task-reminder-std', {
          name: 'Pengingat Tugas & Deadline',
          importance: notifications.AndroidImportance.HIGH,
          enableVibrate: true,
          sound: 'default',
        });
      }

      let perm = await notifications.getPermissionsAsync();
      if (
        perm.status !== 'granted' &&
        askUser &&
        perm.canAskAgain !== false
      ) {
        perm = await notifications.requestPermissionsAsync();
      }
      return perm.status === 'granted';
    } catch {
      return false;
    }
  }

  static async reconcileTaskAlarms(
    tasks: ManagedTaskEntity[],
    askPermission = false
  ): Promise<void> {
    const notifications = getNotifications();
    if (!notifications) return;

    try {
      const scheduled = await notifications.getAllScheduledNotificationsAsync();
      for (const item of scheduled) {
        if (item.identifier.startsWith('managed-task-')) {
          await notifications.cancelScheduledNotificationAsync(item.identifier);
        }
      }

      const activeTasks = tasks.filter(
        (t) => !t.isCompleted && t.alertMode !== 'NONE'
      );
      if (activeTasks.length === 0) return;

      const granted = await this.ensureChannelsAndPermissions(askPermission);
      if (!granted) return;

      const now = Date.now();

      for (const task of activeTasks) {
        const execMs = task.snoozedUntilIso
          ? Date.parse(task.snoozedUntilIso)
          : toLocalEpochMs(task.executionDate, task.executionTime);

        const contextPrefix = task.courseOrContext
          ? `[${task.courseOrContext}] `
          : '';

        // 1. Pre-execution 15-min preparation notification (for BOTH or NOTIFICATION)
        if (
          (task.alertMode === 'BOTH' || task.alertMode === 'NOTIFICATION') &&
          !task.snoozedUntilIso
        ) {
          const prepMs = execMs - 15 * 60_000;
          if (prepMs > now) {
            await notifications.scheduleNotificationAsync({
              identifier: `managed-task-prep-${task.id}`,
              content: {
                title: '⏳ 15 Menit Lagi Waktunya Kerjakan Tugas',
                body: `${contextPrefix}${task.title} dijadwalkan pukul ${task.executionTime}. Siapkan dirimu!`,
                sound: 'default',
                data: {
                  managedTaskId: task.id,
                  isTaskAlarm: false,
                },
              },
              trigger: {
                type: notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(prepMs),
                channelId: 'task-reminder-std',
              },
            });
          }
        }

        // 2. Main execution time trigger (ALARM or NOTIFICATION)
        if (execMs > now) {
          const isLoudAlarm =
            task.alertMode === 'ALARM' || task.alertMode === 'BOTH';

          await notifications.scheduleNotificationAsync({
            identifier: `managed-task-exec-${task.id}`,
            content: {
              title: isLoudAlarm
                ? '🚨 ALARM TUGAS: Waktunya Kerjakan Sekarang!'
                : '🔔 Pengingat Jadwal Pengerjaan Tugas',
              body: `${contextPrefix}${task.title} · Ketuk untuk mulai fokus sekarang (Deadline: ${task.deadlineDate} ${task.deadlineTime}).`,
              sound: 'default',
              data: {
                managedTaskId: task.id,
                isTaskAlarm: isLoudAlarm,
              },
            },
            trigger: {
              type: notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(execMs),
              channelId: isLoudAlarm ? 'task-alarm-loud' : 'task-reminder-std',
            },
          });
        }
      }
    } catch {
      // Ignore notification scheduling errors so DB writes never fail
    }
  }
}

