import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  userSettings,
  targets,
  projects,
  tasks,
  focusSessions,
  agendaEvents,
  lifePillars,
  milestones,
  dailyFocusItems,
} from '@/db/schema';
import type { SettingsRepository } from '../../domain/repositories/settings.repository';
import {
  UserSettingsEntity,
  DEFAULT_SETTINGS,
  DatabaseStats,
} from '../../domain/entities/settings.entity';

export class SettingsRepositoryImpl implements SettingsRepository {
  async getSettings(): Promise<UserSettingsEntity> {
    try {
      const rows = await db.select().from(userSettings);
      const settingsMap = new Map<string, string>();
      for (const row of rows) {
        settingsMap.set(row.key, row.value);
      }

      const pomodoroMinutes = settingsMap.has('pomodoro_minutes')
        ? parseInt(settingsMap.get('pomodoro_minutes')!, 10)
        : DEFAULT_SETTINGS.pomodoroMinutes;

      const deepFlowMinutes = settingsMap.has('deep_flow_minutes')
        ? parseInt(settingsMap.get('deep_flow_minutes')!, 10)
        : DEFAULT_SETTINGS.deepFlowMinutes;

      const hapticsEnabled = settingsMap.has('haptics_enabled')
        ? settingsMap.get('haptics_enabled') === 'true'
        : DEFAULT_SETTINGS.hapticsEnabled;

      const keepAwakeEnabled = settingsMap.has('keep_awake_enabled')
        ? settingsMap.get('keep_awake_enabled') === 'true'
        : DEFAULT_SETTINGS.keepAwakeEnabled;

      return {
        pomodoroMinutes,
        deepFlowMinutes,
        hapticsEnabled,
        keepAwakeEnabled,
      };
    } catch (error) {
      console.error('[SettingsRepositoryImpl] getSettings error:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(
    partial: Partial<UserSettingsEntity>
  ): Promise<UserSettingsEntity> {
    try {
      const now = new Date().toISOString();

      if (partial.pomodoroMinutes !== undefined) {
        await db
          .insert(userSettings)
          .values({
            key: 'pomodoro_minutes',
            value: partial.pomodoroMinutes.toString(),
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: userSettings.key,
            set: {
              value: partial.pomodoroMinutes.toString(),
              updatedAt: now,
            },
          });
      }

      if (partial.deepFlowMinutes !== undefined) {
        await db
          .insert(userSettings)
          .values({
            key: 'deep_flow_minutes',
            value: partial.deepFlowMinutes.toString(),
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: userSettings.key,
            set: {
              value: partial.deepFlowMinutes.toString(),
              updatedAt: now,
            },
          });
      }

      if (partial.hapticsEnabled !== undefined) {
        await db
          .insert(userSettings)
          .values({
            key: 'haptics_enabled',
            value: partial.hapticsEnabled ? 'true' : 'false',
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: userSettings.key,
            set: {
              value: partial.hapticsEnabled ? 'true' : 'false',
              updatedAt: now,
            },
          });
      }

      if (partial.keepAwakeEnabled !== undefined) {
        await db
          .insert(userSettings)
          .values({
            key: 'keep_awake_enabled',
            value: partial.keepAwakeEnabled ? 'true' : 'false',
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: userSettings.key,
            set: {
              value: partial.keepAwakeEnabled ? 'true' : 'false',
              updatedAt: now,
            },
          });
      }

      return await this.getSettings();
    } catch (error) {
      console.error('[SettingsRepositoryImpl] saveSettings error:', error);
      return await this.getSettings();
    }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const allTargets = await db.select().from(targets);
      const allProjects = await db.select().from(projects);
      const allTasks = await db.select().from(tasks);
      const allFocus = await db.select().from(focusSessions);
      const allAgenda = await db.select().from(agendaEvents);

      return {
        targetsCount: allTargets.length,
        projectsCount: allProjects.length,
        tasksCount: allTasks.length,
        focusSessionsCount: allFocus.length,
        agendaEventsCount: allAgenda.length,
      };
    } catch (error) {
      console.error('[SettingsRepositoryImpl] getDatabaseStats error:', error);
      return {
        targetsCount: 0,
        projectsCount: 0,
        tasksCount: 0,
        focusSessionsCount: 0,
        agendaEventsCount: 0,
      };
    }
  }

  async exportBackupJson(): Promise<string> {
    try {
      const pillarsData = await db.select().from(lifePillars);
      const targetsData = await db.select().from(targets);
      const projectsData = await db.select().from(projects);
      const milestonesData = await db.select().from(milestones);
      const tasksData = await db.select().from(tasks);
      const dailyFocusData = await db.select().from(dailyFocusItems);
      const focusData = await db.select().from(focusSessions);
      const agendaData = await db.select().from(agendaEvents);
      const settingsData = await db.select().from(userSettings);

      const backup = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        database: 'mylife.db',
        data: {
          lifePillars: pillarsData,
          targets: targetsData,
          projects: projectsData,
          milestones: milestonesData,
          tasks: tasksData,
          dailyFocusItems: dailyFocusData,
          focusSessions: focusData,
          agendaEvents: agendaData,
          userSettings: settingsData,
        },
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('[SettingsRepositoryImpl] exportBackupJson error:', error);
      throw new Error('Gagal mengekspor data cadangan JSON.');
    }
  }
}

export const settingsRepository = new SettingsRepositoryImpl();
