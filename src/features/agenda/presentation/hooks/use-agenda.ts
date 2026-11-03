import { useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDeviceCalendar } from '@/shared/hooks/use-device-calendar';
import type { AgendaEventEntity, CreateAgendaInput } from '../../domain/entities/agenda.entity';
import type { ProjectedWeeklyOccurrence } from '../../domain/entities/weekly-schedule.entity';
import { reminderTrigger } from '../../domain/agenda-time';
import { agendaRepository } from '../../data/repositories/agenda.repository.impl';
import { weeklyScheduleRepository } from '../../data/repositories/weekly-schedule.repository.impl';
import { AgendaNotificationService } from '../../data/services/agenda-notification.service';

export function useAgenda() {
  const calendar = useDeviceCalendar();
  const [selectedDate, setSelectedDate] = useState(calendar.date);
  const previousToday = useRef(calendar.date);
  useEffect(() => {
    const previous = previousToday.current;
    setSelectedDate(selected => selected === previous ? calendar.date : selected);
    previousToday.current = calendar.date;
  }, [calendar.date]);
  const [events, setEvents] = useState<AgendaEventEntity[]>([]);
  const [weeklyOccurrences, setWeeklyOccurrences] = useState<ProjectedWeeklyOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderWarning, setReminderWarning] = useState<string | null>(null);
  const request = useRef(0);
  const viewKey = selectedDate + '|' + calendar.key;
  const currentView = useRef(viewKey);
  useEffect(() => { currentView.current = viewKey; request.current++; }, [viewKey]);

  const loadEvents = useCallback(async () => {
    if (currentView.current !== viewKey) return;
    const version = ++request.current;
    try {
      const [items, projected] = await Promise.all([
        agendaRepository.getEventsForDate(selectedDate),
        weeklyScheduleRepository.getProjectedSchedulesForDate(selectedDate),
      ]);
      if (version !== request.current || currentView.current !== viewKey) return;
      setEvents(items);
      setWeeklyOccurrences(projected);
      setError(null);
    } catch (err) {
      if (version === request.current && currentView.current === viewKey) setError(err instanceof Error ? err.message : 'Gagal memuat agenda.');
    } finally {
      if (version === request.current && currentView.current === viewKey) setIsLoading(false);
    }
  }, [selectedDate, viewKey]);

  const syncReminders = useCallback(async (askPermission = false) => {
    let ready = false;
    try { ready = await AgendaNotificationService.reconcileReminders(() => agendaRepository.getReminderEvents(), askPermission); } catch { /* The database operation has already committed. */ }
    setReminderWarning(ready ? null : 'Agenda tetap tersimpan. Sebagian pengingat mungkin belum aktif atau dapat terlambat. Periksa izin notifikasi/alarm tepat waktu dan dukungan perangkat. Maksimal 50 pengingat terdekat dijadwalkan; web belum mendukung pengingat.');
  }, []);
  const refresh = useCallback(async () => { setIsLoading(true); await loadEvents(); }, [loadEvents]);
  useFocusEffect(useCallback(() => {
    setIsLoading(true); void loadEvents();
    return () => { request.current++; };
  }, [loadEvents]));
  useFocusEffect(useCallback(() => { void syncReminders(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Clock/zone/resume changes must also reconcile legacy wall-time reminders.
    [syncReminders, calendar.key]));

  const addEvent = async (input: CreateAgendaInput): Promise<boolean> => {
    let created: AgendaEventEntity;
    try { created = await agendaRepository.createEvent(input); }
    catch (err) { setError(err instanceof Error ? err.message : 'Agenda belum tersimpan.'); return false; }
    // Notification failures are separate from the committed database write, avoiding duplicate retries.
    await syncReminders(true);
    const trigger = reminderTrigger(created);
    if (trigger !== null && trigger <= Date.now()) setReminderWarning('Agenda tersimpan. Waktu pengingat sudah lewat sehingga pengingat untuk agenda ini tidak dijadwalkan.');
    await loadEvents();
    return true;
  };
  const toggleEvent = async (id: string, currentCompleted: boolean) => {
    try { await agendaRepository.toggleEventCompletion(id, !currentCompleted); }
    catch { setError('Status agenda belum tersimpan. Coba lagi.'); return; }
    await syncReminders(); await loadEvents();
  };
  const removeEvent = async (id: string) => {
    try { await agendaRepository.deleteEvent(id); }
    catch { setError('Agenda belum dapat dihapus. Coba lagi.'); return; }
    await syncReminders(); await loadEvents();
  };

  const toggleWeeklyOccurrence = async (scheduleId: string, currentCompleted: boolean) => {
    try {
      await weeklyScheduleRepository.setOccurrenceCompletion(scheduleId, selectedDate, !currentCompleted);
    } catch {
      setError('Status jadwal rutin belum tersimpan. Coba lagi.');
      return;
    }
    await loadEvents();
  };

  const toggleWeeklyOccurrenceCancellation = async (scheduleId: string, currentCancelled: boolean) => {
    try {
      await weeklyScheduleRepository.setOccurrenceCancellation(scheduleId, selectedDate, !currentCancelled);
    } catch {
      setError('Status pembatalan jadwal belum tersimpan. Coba lagi.');
      return;
    }
    await loadEvents();
  };

  return {
    selectedDate,
    setSelectedDate,
    events,
    weeklyOccurrences,
    isLoading,
    error,
    reminderWarning,
    todayDate: calendar.date,
    timeZone: calendar.zone,
    isSelectedDateToday: selectedDate === calendar.date,
    refresh,
    addEvent,
    toggleEvent,
    removeEvent,
    toggleWeeklyOccurrence,
    toggleWeeklyOccurrenceCancellation,
    retryReminders: async () => {
      await AgendaNotificationService.requestExactAlarmPermission();
      await syncReminders(true);
    },
  };
}
