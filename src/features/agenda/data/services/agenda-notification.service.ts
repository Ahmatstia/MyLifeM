import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export class AgendaNotificationService {
  /**
   * Request notification permissions for Android/iOS
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
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
    if (Platform.OS === 'web' || reminderMinutes <= 0) return null;

    try {
      const eventTime = new Date(startTimeIso).getTime();
      const triggerTimeMs = eventTime - reminderMinutes * 60 * 1000;

      // Do not schedule if time has already passed
      if (triggerTimeMs <= Date.now()) return null;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: `agenda-${eventId}`,
        content: {
          title: 'Pengingat Agenda MyLife',
          body: `"${title}" akan dimulai dalam ${reminderMinutes} menit.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
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
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(`agenda-${eventId}`);
    } catch (err) {
      console.warn('[AgendaNotificationService] cancelReminder error:', err);
    }
  }
}
