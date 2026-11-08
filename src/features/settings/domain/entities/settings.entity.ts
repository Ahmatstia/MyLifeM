/**
 * Settings Domain Entity & Types
 * Configurable preferences for Pomodoro, Deep Flow, Haptics, Prayer Location, and Local-First storage.
 */

export interface UserSettingsEntity {
  pomodoroMinutes: number;
  deepFlowMinutes: number;
  hapticsEnabled: boolean;
  keepAwakeEnabled: boolean;
  prayerCity: string;
  prayerLatitude: number;
  prayerLongitude: number;
}

export const DEFAULT_SETTINGS: UserSettingsEntity = {
  pomodoroMinutes: 25,
  deepFlowMinutes: 50,
  hapticsEnabled: true,
  keepAwakeEnabled: true,
  prayerCity: 'Jakarta (WIB)',
  prayerLatitude: -6.2088,
  prayerLongitude: 106.8456,
};

export interface DatabaseStats {
  targetsCount: number;
  projectsCount: number;
  tasksCount: number;
  focusSessionsCount: number;
  agendaEventsCount: number;
}
