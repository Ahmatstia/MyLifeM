import { useFocusedResource } from '@/shared/hooks/use-focused-resource';
import { useDeviceCalendar } from '@/shared/hooks/use-device-calendar';
import { useCallback } from 'react';
import type {
  SaveSessionInput,
} from '../../domain/entities/daily-focus.entity';
import { dailyFocusRepository } from '../../data/repositories/daily-focus.repository.impl';

export function useTodayFocus() {
  const calendar = useDeviceCalendar();
  const todayDate = calendar.date;
  const read = useCallback(async () => {
    const [focusItems, completedMinutes, availableTasks] = await Promise.all([
      dailyFocusRepository.getTodayFocusItems(todayDate),
      dailyFocusRepository.getTodayCompletedMinutes(todayDate),
      dailyFocusRepository.getAvailableTasks(),
    ]);
    return { focusItems, completedMinutes, availableTasks };
  }, [todayDate]);
  const { data, isLoading, error, refresh, setError } = useFocusedResource(calendar.key, read, 'Gagal memuat fokus hari ini.');
  const { focusItems = [], completedMinutes = 0, availableTasks = [] } = data || {};
  const loadData = refresh;

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      await dailyFocusRepository.toggleTaskCompletion(taskId, !currentCompleted);
      await loadData();
    } catch (err) {
      console.error('[useTodayFocus] Toggle error:', err);
      setError('Status tugas belum tersimpan. Coba lagi.');
    }
  };

  const addQuickTask = async (title: string, targetId?: string): Promise<boolean> => {
    try {
      await dailyFocusRepository.createQuickTask(title, todayDate, targetId);
      await loadData();
      return true;
    } catch (err: any) {
      console.error('[useTodayFocus] Add quick task error:', err);
      setError(err.message || 'Gagal menambahkan tugas prioritas.');
      return false;
    }
  };

  const addTaskToToday = async (taskId: string): Promise<boolean> => {
    try {
      await dailyFocusRepository.addFocusItem(todayDate, taskId);
      await loadData();
      return true;
    } catch (err: any) {
      console.error('[useTodayFocus] Add to today error:', err);
      setError(err.message || 'Gagal menambahkan ke hari ini.');
      return false;
    }
  };

  const removeFromToday = async (focusItemId: string) => {
    try {
      await dailyFocusRepository.removeFocusItem(focusItemId);
      await loadData();
    } catch (err) {
      console.error('[useTodayFocus] Remove error:', err);
      setError('Prioritas belum dapat dilepas. Coba lagi.');
    }
  };

  const recordSession = async (input: SaveSessionInput) => {
    try {
      await dailyFocusRepository.saveFocusSession(input);
      await loadData();
    } catch (err) {
      console.error('[useTodayFocus] Record session error:', err);
      throw err;
    }
  };

  return {
    todayDate,
    focusItems,
    completedMinutes,
    availableTasks,
    isLoading,
    error,
    refresh,
    toggleTask,
    addQuickTask,
    addTaskToToday,
    removeFromToday,
    recordSession,
  };
}
