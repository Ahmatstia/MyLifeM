import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { parseInstant } from '@/shared/utils/local-date';

interface ReminderEvent {
  id: string; title: string; startTime: string; reminderMinutes: number | null;
  isAllDay: boolean | number; isCompleted: boolean | number;
}
let notificationsModule: typeof import('expo-notifications') | null = null;
let isLoaded = false;
export const MAX_PENDING_REMINDERS = 50;
function getNotifications() {
  if (isLoaded) return notificationsModule;
  isLoaded = true;
  if (Platform.OS === 'web') return null;
  try {
    // SDK 58's barrel eagerly imports this Android push module, even for local-only usage.
    if (Platform.OS === 'android' && !requireOptionalNativeModule('ExpoTopicSubscriptionModule')) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module: typeof import('expo-notifications') = require('expo-notifications');
    module.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
    notificationsModule = module;
  } catch { /* Unsupported builds are reported by the caller, without losing the saved agenda. */ }
  return notificationsModule;
}

export class AgendaNotificationService {
  private static queue: Promise<unknown> = Promise.resolve();

  static async requestPermissions(request = true): Promise<boolean> {
    const notifications = getNotifications();
    if (!notifications) return false;
    try {
      if (Platform.OS === 'android') await notifications.setNotificationChannelAsync('agenda', { name: 'Pengingat agenda', importance: notifications.AndroidImportance.DEFAULT });
      let permission = await notifications.getPermissionsAsync();
      if (permission.status !== 'granted' && request && permission.canAskAgain !== false) permission = await notifications.requestPermissionsAsync();
      return permission.status === 'granted' || (permission.ios !== undefined && permission.ios.status === notifications.IosAuthorizationStatus.PROVISIONAL);
    } catch { return false; }
  }

  static async scheduleReminder(eventId: string, title: string, startTimeIso: string, reminderMinutes: number | null, requestPermission = true): Promise<string | null> {
    if (reminderMinutes === null || !Number.isSafeInteger(reminderMinutes) || reminderMinutes < 0) return null;
    try {
      const trigger = parseInstant(startTimeIso).getTime() - reminderMinutes * 60_000;
      if (!Number.isFinite(trigger) || trigger <= Date.now()) return null;
      const notifications = getNotifications();
      if (!notifications || !await this.requestPermissions(requestPermission)) return null;
      return await notifications.scheduleNotificationAsync({
        identifier: `agenda-${eventId}`,
        content: { title: 'Pengingat Agenda MyLife', body: reminderMinutes === 0 ? `"${title}" dimulai sekarang.` : `"${title}" akan dimulai dalam ${reminderMinutes} menit.`, sound: 'default' },
        trigger: { type: notifications.SchedulableTriggerInputTypes.DATE, date: new Date(trigger), channelId: 'agenda' },
      });
    } catch { return null; }
  }

  static async requestExactAlarmPermission(): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      const notifications = getNotifications();
      if (!notifications) return;
      const permission = await notifications.getExactAlarmPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) await notifications.requestExactAlarmPermissionsAsync();
    } catch { /* Reconciliation reports missing permission after the user returns. */ }
  }

  /** Read desired state when the queued operation runs, so an older refresh cannot outlive a delete. */
  static reconcileReminders(readEvents: () => Promise<ReminderEvent[]>, requestPermission = false): Promise<boolean> {
    const operation = this.queue.catch(() => {}).then(async () => {
      try {
        const events = (await readEvents()).filter(event => !event.isCompleted && !event.isAllDay && event.reminderMinutes !== null
          && parseInstant(event.startTime).getTime() - event.reminderMinutes * 60_000 > Date.now());
        const notifications = getNotifications();
        if (!notifications) return events.length === 0;
        const scheduled = await notifications.getAllScheduledNotificationsAsync();
        for (const item of scheduled) if (item.identifier.startsWith('agenda-')) await notifications.cancelScheduledNotificationAsync(item.identifier);
        if (!events.length) return true;
        if (!await this.requestPermissions(requestPermission)) return false;
        let ready = events.length <= MAX_PENDING_REMINDERS;
        events.sort((a, b) => parseInstant(a.startTime).getTime() - Number(a.reminderMinutes) * 60_000 - (parseInstant(b.startTime).getTime() - Number(b.reminderMinutes) * 60_000));
        // shortcut: enqueue only the 50 nearest reminders; refill on reopen/resume/midnight, and report partial coverage.
        for (const event of events.slice(0, MAX_PENDING_REMINDERS)) if (!await this.scheduleReminder(event.id, event.title, event.startTime, event.reminderMinutes, false)) ready = false;
        if (Platform.OS === 'android' && !(await notifications.getExactAlarmPermissionsAsync()).granted) ready = false;
        return ready;
      } catch { return false; }
    });
    this.queue = operation;
    return operation;
  }

  static reconcileAfterRestore(events: ReminderEvent[]): Promise<boolean> {
    return this.reconcileReminders(async () => events);
  }

  static async cancelReminder(eventId: string): Promise<boolean> {
    try {
      const notifications = getNotifications();
      if (!notifications) return false;
      await notifications.cancelScheduledNotificationAsync(`agenda-${eventId}`);
      return true;
    } catch { return false; }
  }
}
