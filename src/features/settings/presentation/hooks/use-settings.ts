import { useState, useEffect, useCallback } from 'react';
import type {
  UserSettingsEntity,
  DatabaseStats,
} from '../../domain/entities/settings.entity';
import { DEFAULT_SETTINGS } from '../../domain/entities/settings.entity';
import { settingsRepository } from '../../data/repositories/settings.repository.impl';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettingsEntity>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<DatabaseStats>({
    targetsCount: 0,
    projectsCount: 0,
    tasksCount: 0,
    focusSessionsCount: 0,
    agendaEventsCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [backupJson, setBackupJson] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [currentSettings, currentStats] = await Promise.all([
        settingsRepository.getSettings(),
        settingsRepository.getDatabaseStats(),
      ]);
      setSettings(currentSettings);
      setStats(currentStats);
    } catch (err) {
      console.error('[useSettings] loadData error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSetting = async (partial: Partial<UserSettingsEntity>) => {
    try {
      // Optimistic update
      setSettings((prev) => ({ ...prev, ...partial }));
      const updated = await settingsRepository.saveSettings(partial);
      setSettings(updated);
    } catch (err) {
      console.error('[useSettings] updateSetting error:', err);
      // Revert
      loadData();
    }
  };

  const handleExportBackup = async (): Promise<string | null> => {
    try {
      setIsExporting(true);
      const json = await settingsRepository.exportBackupJson();
      setBackupJson(json);
      return json;
    } catch (err) {
      console.error('[useSettings] exportBackup error:', err);
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    settings,
    stats,
    isLoading,
    isExporting,
    backupJson,
    setBackupJson,
    updateSetting,
    exportBackup: handleExportBackup,
    refresh: loadData,
  };
}
