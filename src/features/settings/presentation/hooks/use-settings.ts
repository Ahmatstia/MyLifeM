import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { notifyDataRestored } from '@/db/data-revision';
import { AgendaNotificationService } from '@/features/agenda/data/services/agenda-notification.service';
import { parseBackup, summarizeBackup } from '../../data/backup-format';
import { pickBackupFile, saveBackupFile, saveRecoveryBackup, readRecoveryBackup } from '../../data/services/backup-file.service';
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
  const busy = useRef(false);
  const [backupBusy, setBackupBusy] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<{ json: string; summary: ReturnType<typeof summarizeBackup> } | null>(null);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);

  const loadData = useCallback(async () => {
    try {
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

  // refresh eksplisit menyalakan loading; loader sendiri tidak mengubah state sinkron di effect
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
    readRecoveryBackup().then(json => setRecoveryAvailable(json !== null)).catch(() => {});
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

  const runBackupAction = async (action: string, work: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setBackupBusy(action);
    setBackupError(null);
    setBackupNotice(null);
    try {
      await work();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Operasi cadangan gagal. Silakan coba lagi.');
    } finally {
      busy.current = false;
      setBackupBusy(null);
    }
  };

  const exportBackup = () => runBackupAction('export', async () => {
    await saveBackupFile(await settingsRepository.exportBackupJson());
    setBackupNotice('Berkas telah disiapkan. Pastikan cadangan disimpan di lokasi pilihanmu sebelum menghapus aplikasi.');
  });
  const inspectBackup = () => runBackupAction('pick', async () => {
    const json = await pickBackupFile();
    if (json !== null) setPendingBackup({ json, summary: summarizeBackup(parseBackup(json)) });
  });
  const exportRecovery = () => runBackupAction('recovery', async () => {
    const json = await readRecoveryBackup();
    if (!json) throw new Error('Cadangan sebelum pemulihan belum tersedia.');
    await saveBackupFile(json);
  });
  const restoreBackup = () => runBackupAction('restore', async () => {
    if (!pendingBackup) return;
    const document = parseBackup(pendingBackup.json);
    const safety = await settingsRepository.exportBackupJson();
    await saveRecoveryBackup(safety);
    setRecoveryAvailable(true);
    await settingsRepository.restoreBackupJson(pendingBackup.json, safety);
    router.replace('/(tabs)');
    notifyDataRestored();
    // Everything after commit is feedback/side effects; failure here must never claim a rolled-back restore.
    let remindersReady = false;
    try { remindersReady = await AgendaNotificationService.reconcileAfterRestore(document.data.agendaEvents); } catch { /* reported below */ }
    const message = 'Data berhasil dipulihkan. Cadangan data sebelumnya tersedia di Pengaturan.'
      + (remindersReady ? '' : ' Pengingat belum dapat diselaraskan; periksa izin dan jadwal agenda di perangkat.');
    if (Platform.OS === 'web') window.alert(message);
    else Alert.alert('Pemulihan selesai', message);
  });

  return {
    settings,
    stats,
    isLoading,
    backupBusy, backupError, backupNotice, pendingBackup, recoveryAvailable,
    closeBackup: () => { if (!busy.current) { setPendingBackup(null); setBackupError(null); } },
    updateSetting,
    exportBackup, inspectBackup, restoreBackup, exportRecovery,
    refresh,
  };
}
