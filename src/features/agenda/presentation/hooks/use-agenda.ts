import { useState, useEffect, useCallback } from 'react';
import type {
  AgendaEventEntity,
  CreateAgendaInput,
} from '../../domain/entities/agenda.entity';
import { agendaRepository } from '../../data/repositories/agenda.repository.impl';
import { AgendaNotificationService } from '../../data/services/agenda-notification.service';

export function useAgenda() {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [events, setEvents] = useState<AgendaEventEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await agendaRepository.getEventsForDate(selectedDate);
      setEvents(items);
    } catch (err: any) {
      console.error('[useAgenda] Load error:', err);
      setError('Gagal memuat agenda hari ini.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const addEvent = async (input: CreateAgendaInput): Promise<boolean> => {
    try {
      const created = await agendaRepository.createEvent(input);
      if (input.reminderMinutes && input.reminderMinutes > 0 && !input.isAllDay) {
        await AgendaNotificationService.scheduleReminder(
          created.id,
          created.title,
          created.startTime,
          input.reminderMinutes
        );
      }
      await loadEvents();
      return true;
    } catch (err) {
      console.error('[useAgenda] Add event error:', err);
      return false;
    }
  };

  const toggleEvent = async (id: string, currentCompleted: boolean) => {
    try {
      await agendaRepository.toggleEventCompletion(id, !currentCompleted);
      if (!currentCompleted) {
        // Was marked completed, cancel pending reminder
        await AgendaNotificationService.cancelReminder(id);
      }
      await loadEvents();
    } catch (err) {
      console.error('[useAgenda] Toggle event error:', err);
    }
  };

  const removeEvent = async (id: string) => {
    try {
      await AgendaNotificationService.cancelReminder(id);
      await agendaRepository.deleteEvent(id);
      await loadEvents();
    } catch (err) {
      console.error('[useAgenda] Delete event error:', err);
    }
  };

  const isSelectedDateToday = selectedDate === getTodayStr();

  return {
    selectedDate,
    setSelectedDate,
    events,
    isLoading,
    error,
    isSelectedDateToday,
    refresh: loadEvents,
    addEvent,
    toggleEvent,
    removeEvent,
  };
}
