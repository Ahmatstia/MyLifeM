/**
 * Settings Domain Entity & Types
 * Configurable preferences for Pomodoro, Deep Flow, Haptics, and Local-First storage.
 */

export interface UserSettingsEntity {
  pomodoroMinutes: number;
  deepFlowMinutes: number;
  hapticsEnabled: boolean;
  keepAwakeEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettingsEntity = {
  pomodoroMinutes: 25,
  deepFlowMinutes: 50,
  hapticsEnabled: true,
  keepAwakeEnabled: true,
};

export interface DatabaseStats {
  targetsCount: number;
  projectsCount: number;
  tasksCount: number;
  focusSessionsCount: number;
  agendaEventsCount: number;
}
