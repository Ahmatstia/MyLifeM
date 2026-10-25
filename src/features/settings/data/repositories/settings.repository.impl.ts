import * as SQLite from 'expo-sqlite';
import { db, getSqliteDb, TABLES_DDL, INDEXES_DDL } from '@/db/client';
import {
  userSettings,
  targets,
  projects,
  tasks,
  focusSessions,
  agendaEvents,
} from '@/db/schema';
import type { SettingsRepository } from '../../domain/repositories/settings.repository';
import {
  UserSettingsEntity,
  DEFAULT_SETTINGS,
  DatabaseStats,
} from '../../domain/entities/settings.entity';
import { parseBackup, serializeBackup } from '../backup-format';
import { readBackupData, replaceBackupData, replaceIfUnchanged } from '../backup-store';
import { INTEGRITY_DDL } from '@/db/integrity';

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

      db.transaction(tx => {
        if (partial.pomodoroMinutes !== undefined) {
          tx
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
            }).run();
        }

        if (partial.deepFlowMinutes !== undefined) {
          tx
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
            }).run();
        }

        if (partial.hapticsEnabled !== undefined) {
          tx
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
            }).run();
        }

        if (partial.keepAwakeEnabled !== undefined) {
          tx
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
            }).run();
        }

      });

      return await this.getSettings();
    } catch (error) {
      console.error('[SettingsRepositoryImpl] saveSettings error:', error);
      throw error;
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
    const connection = getSqliteDb();
    let json = '';
    connection.withTransactionSync(() => { json = serializeBackup(readBackupData(connection)); });
    return json;
  }

  async restoreBackupJson(json: string, safetyJson: string): Promise<void> {
    const backup = parseBackup(json);
    const staging = SQLite.openDatabaseSync(':memory:', { useNewConnection: true });
    try {
      staging.execSync('PRAGMA foreign_keys = ON;');
      staging.execSync(TABLES_DDL + INDEXES_DDL);
      staging.withTransactionSync(() => replaceBackupData(staging, backup.data));
      staging.execSync(INTEGRITY_DDL);
    } finally {
      staging.closeSync();
    }
    replaceIfUnchanged(getSqliteDb(), backup.data, safetyJson);
  }
}

export const settingsRepository = new SettingsRepositoryImpl();
