import { Platform } from 'react-native';
import type { AgendaEvent } from '@/db/schema';

let notificationsModule: any = null;
let isLoaded = false;

/**
 * Safely get notifications module only when native support is present.
 * In Expo Go on Android, expo-notifications fails due to missing ExpoTopicSubscriptionModule.
 */
function getNotifications() {
  if (isLoaded) return notificationsModule;
  isLoaded = true;

  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isRunningInExpoGo } = require('expo');
    if (isRunningInExpoGo && isRunningInExpoGo()) {
      // In Expo Go, native push notification modules (ExpoTopicSubscriptionModule) are not bundled
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications');
    return notificationsModule;
  } catch {
    console.warn('[AgendaNotificationService] Notifications native module unavailable in this environment.');
    return null;
  }
}

export class AgendaNotificationService {
  static async reconcileAfterRestore(events: Pick<AgendaEvent, 'id' | 'title' | 'isCompleted' | 'isAllDay' | 'reminderMinutes' | 'startTime'>[]): Promise<boolean> {
    const notifications = getNotifications();
    if (!notifications) return false;
    const scheduled: { identifier: string }[] = await notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      if (item.identifier.startsWith('agenda-')) await notifications.cancelScheduledNotificationAsync(item.identifier);
    }
    let complete = true;
    for (const event of events) {
      if (event.isCompleted || event.isAllDay || event.reminderMinutes === null) continue;
      const trigger = Date.parse(event.startTime) - event.reminderMinutes * 60_000;
      if (trigger <= Date.now()) continue;
      if (!await this.scheduleReminder(event.id, event.title, event.startTime, event.reminderMinutes)) complete = false;
    }
    return complete;
  }
  /**
   * Request notification permissions for Android/iOS
   */
  static async requestPermissions(): Promise<boolean> {
    const Notifications = getNotifications();
    if (!Notifications) return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Schedule a local notification before event start
   */
  static async scheduleReminder(
    eventId: string,
    title: string,
    startTimeIso: string,
    reminderMinutes: number
  ): Promise<string | null> {
    if (reminderMinutes < 0) return null;

    const Notifications = getNotifications();
    if (!Notifications) return null;

    try {
      const eventTime = new Date(startTimeIso).getTime();
      const triggerTimeMs = eventTime - reminderMinutes * 60 * 1000;

      // Do not schedule if time has already passed
      if (triggerTimeMs <= Date.now()) return null;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const triggerType = Notifications.SchedulableTriggerInputTypes?.DATE || 'date';

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: `agenda-${eventId}`,
        content: {
          title: 'Pengingat Agenda MyLife',
          body: `"${title}" akan dimulai dalam ${reminderMinutes} menit.`,
          sound: 'default',
        },
        trigger: {
          type: triggerType,
          date: new Date(triggerTimeMs),
        },
      });

      return notifId;
    } catch (err) {
      console.warn('[AgendaNotificationService] scheduleReminder error:', err);
      return null;
    }
  }

  /**
   * Cancel scheduled notification when event is completed or deleted
   */
  static async cancelReminder(eventId: string): Promise<void> {
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(`agenda-${eventId}`);
    } catch (err) {
      console.warn('[AgendaNotificationService] cancelReminder error:', err);
    }
  }
}
