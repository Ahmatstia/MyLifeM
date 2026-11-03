import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { weeklyScheduleRepository } from '../../data/repositories/weekly-schedule.repository.impl';
import type {
  WeeklyScheduleEntity,
  CreateWeeklyScheduleInput,
  UpdateWeeklyScheduleInput,
} from '../../domain/entities/weekly-schedule.entity';

export function useWeeklySchedules() {
  const [schedules, setSchedules] = useState<WeeklyScheduleEntity[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Senin
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weeklyScheduleRepository.getAllWeeklySchedules();
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat jadwal mingguan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchSchedules();
    }, [fetchSchedules])
  );

  const schedulesByDay = useMemo(() => {
    const map: Record<number, WeeklyScheduleEntity[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };
    for (const item of schedules) {
      if (map[item.dayOfWeek]) {
        map[item.dayOfWeek].push(item);
      }
    }
    return map;
  }, [schedules]);

  const addSchedule = useCallback(
    async (input: CreateWeeklyScheduleInput): Promise<boolean> => {
      try {
        await weeklyScheduleRepository.createWeeklySchedule(input);
        await fetchSchedules();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menambah jadwal.');
        return false;
      }
    },
    [fetchSchedules]
  );

  const editSchedule = useCallback(
    async (id: string, input: UpdateWeeklyScheduleInput): Promise<boolean> => {
      try {
        await weeklyScheduleRepository.updateWeeklySchedule(id, input);
        await fetchSchedules();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memperbarui jadwal.');
        return false;
      }
    },
    [fetchSchedules]
  );

  const removeSchedule = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await weeklyScheduleRepository.deleteWeeklySchedule(id);
        await fetchSchedules();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus jadwal.');
        return false;
      }
    },
    [fetchSchedules]
  );

  return {
    schedules,
    schedulesByDay,
    selectedDay,
    setSelectedDay,
    isLoading,
    error,
    refresh: fetchSchedules,
    addSchedule,
    editSchedule,
    removeSchedule,
  };
}
