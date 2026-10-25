import { useFocusEffect } from 'expo-router';
import { formatLocalDate } from '@/shared/utils/local-date';
import { useState, useCallback } from 'react';
import type {
  DailyFocusItemEntity,
  TaskEntity,
  SaveSessionInput,
} from '../../domain/entities/daily-focus.entity';
import { dailyFocusRepository } from '../../data/repositories/daily-focus.repository.impl';

export function useTodayFocus() {
  const todayDate = formatLocalDate();

  const [focusItems, setFocusItems] = useState<DailyFocusItemEntity[]>([]);
  const [completedMinutes, setCompletedMinutes] = useState<number>(0);
  const [availableTasks, setAvailableTasks] = useState<TaskEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {

      const [items, totalMins, allTasks] = await Promise.all([
        dailyFocusRepository.getTodayFocusItems(todayDate),
        dailyFocusRepository.getTodayCompletedMinutes(todayDate),
        dailyFocusRepository.getAvailableTasks(),
      ]);

      setFocusItems(items);
      setCompletedMinutes(totalMins);
      setAvailableTasks(allTasks);
      setError(null);
    } catch (err: any) {
      console.error('[useTodayFocus] Load error:', err);
      setError('Gagal memuat fokus hari ini. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [todayDate]);

  // refresh eksplisit menyalakan loading; loader sendiri tidak mengubah state sinkron di effect
  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  useFocusEffect(useCallback(() => {
    void loadData();
  }, [loadData]));

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      await dailyFocusRepository.toggleTaskCompletion(taskId, !currentCompleted);
      await loadData();
    } catch (err) {
      console.error('[useTodayFocus] Toggle error:', err);
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
