import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { localTimeToIso } from '@/shared/utils/local-date';
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
      !requireOptionalNativeModule('ExpoNotificationScheduler')
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

let alarmWarning: string | null = null;
const statusListeners = new Set<(warning: string | null) => void>();
export function subscribeTaskAlarmStatus(listener: (warning: string | null) => void): () => void {
  statusListeners.add(listener); listener(alarmWarning);
  return () => { statusListeners.delete(listener); };
}
function publishStatus(ready: boolean) {
  alarmWarning = ready ? null : 'Tugas tersimpan, tetapi sebagian pengingat belum aktif. Periksa izin notifikasi/alarm tepat waktu dan dukungan perangkat.';
  for (const listener of statusListeners) { try { listener(alarmWarning); } catch { /* A screen cannot fail a committed write. */ } }
  return ready;
}
export interface TaskAlarmResponse { taskId: string; occurrence: string | null; isAlarm: boolean; }

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
      return perm.status === 'granted' || perm.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL;
    } catch {
      return false;
    }
  }

  static async reconcileTaskAlarms(
    tasks: ManagedTaskEntity[],
    askPermission = false
  ): Promise<boolean> {
    const notifications = getNotifications();
    if (!notifications) return publishStatus(!tasks.some(task => !task.isCompleted && task.alertMode !== 'NONE'));

    try {
      const scheduled = await notifications.getAllScheduledNotificationsAsync();
      for (const item of scheduled) {
        if (item.identifier.startsWith('managed-task-')) {
          await notifications.cancelScheduledNotificationAsync(item.identifier);
        }
      }

      const activeTasks = tasks.filter(
        (t) => !t.isCompleted && t.alertMode !== 'NONE' && (t.snoozedUntilIso || !t.lastAlarmFiredKey?.startsWith(t.executionDate + 'T' + t.executionTime))
      );
      if (activeTasks.length === 0) return publishStatus(true);

      const granted = await this.ensureChannelsAndPermissions(askPermission);
      if (!granted) return publishStatus(false);

      const now = Date.now();
      const requests: Parameters<typeof notifications.scheduleNotificationAsync>[0][] = [];

      for (const task of activeTasks) {
        const execMs = task.snoozedUntilIso
          ? Date.parse(task.snoozedUntilIso)
          : Date.parse(localTimeToIso(task.executionDate, task.executionTime));

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
            requests.push({
              identifier: `managed-task-prep-${task.id}`,
              content: {
                title: '⏳ 15 Menit Lagi Waktunya Kerjakan Tugas',
                body: `${contextPrefix}${task.title} dijadwalkan pukul ${task.executionTime}. Siapkan dirimu!`,
                sound: 'default',
                data: {
                  managedTaskId: task.id,
                  isTaskAlarm: false,
                  occurrence: task.executionDate + 'T' + task.executionTime,
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

          requests.push({
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
                occurrence: task.snoozedUntilIso ? 'snooze:' + task.snoozedUntilIso : task.executionDate + 'T' + task.executionTime,
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
      requests.sort((a, b) => Number((a.trigger as { date: Date }).date) - Number((b.trigger as { date: Date }).date));
      let ready = requests.length <= 50;
      for (const request of requests.slice(0, 50)) {
        try { await notifications.scheduleNotificationAsync(request); } catch { ready = false; }
      }
      if (Platform.OS === 'android' && !(await notifications.getExactAlarmPermissionsAsync()).granted) ready = false;
      return publishStatus(ready);
    } catch { return publishStatus(false); }
  }

  static async requestExactAlarmPermission(): Promise<void> {
    if (Platform.OS !== 'android') return;
    const notifications = getNotifications();
    if (!notifications) return;
    try {
      const permission = await notifications.getExactAlarmPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) await notifications.requestExactAlarmPermissionsAsync();
    } catch { /* Reconciliation publishes the permission warning. */ }
  }

  static observeResponses(onResponse: (response: TaskAlarmResponse) => Promise<void>): () => void {
    const notifications = getNotifications();
    if (!notifications) return () => {};
    let alive = true;
    const handled = new Set<string>();
    const receive = async (response: import('expo-notifications').NotificationResponse | null) => {
      if (!alive || !response || response.actionIdentifier !== notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const { request, date } = response.notification;
      if (!request.identifier.startsWith('managed-task-')) return;
      const data = request.content.data;
      if (typeof data?.managedTaskId !== 'string') return;
      const key = request.identifier + '|' + date;
      if (handled.has(key)) return;
      handled.add(key);
      try {
        await onResponse({ taskId: data.managedTaskId, occurrence: typeof data.occurrence === 'string' ? data.occurrence : null,
          isAlarm: data.isTaskAlarm === true });
        if (alive) notifications.clearLastNotificationResponse();
      } catch { handled.delete(key); }
    };
    try {
      const subscription = notifications.addNotificationResponseReceivedListener(response => { void receive(response); });
      void receive(notifications.getLastNotificationResponse());
      return () => { alive = false; subscription.remove(); };
    } catch { return () => { alive = false; }; }
  }
}
