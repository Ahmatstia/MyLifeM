import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { formatLocalDate } from '@/shared/utils/local-date';
import { weeklyScheduleRepository } from '../../data/repositories/weekly-schedule.repository.impl';
import type { ProjectedWeeklyOccurrence } from '../../domain/entities/weekly-schedule.entity';

export function useNextSchedule() {
  const [nextSchedule, setNextSchedule] = useState<ProjectedWeeklyOccurrence | null>(null);

  const fetchNextSchedule = useCallback(async () => {
    try {
      const todayStr = formatLocalDate();
      const occurrences = await weeklyScheduleRepository.getProjectedSchedulesForDate(todayStr);
      const active = occurrences.filter((occ) => !occ.isCancelled && !occ.isCompleted);
      const nowIso = new Date().toISOString();
      const commitments = active.filter((occ) => occ.schedule.scheduleType !== 'ROUTINE');
      // Prioritaskan komitmen utama (kuliah/kerja) agar tidak terlewat, fallback ke ritme harian
      const upcoming = commitments.find((occ) => occ.endIso > nowIso)
        || commitments[0]
        || active.find((occ) => occ.endIso > nowIso)
        || active[0];
      setNextSchedule(upcoming || null);
    } catch {
      // Non-critical background fetch
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchNextSchedule();
    }, [fetchNextSchedule])
  );

  return { nextSchedule, refreshNextSchedule: fetchNextSchedule };
}
