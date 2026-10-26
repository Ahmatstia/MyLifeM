import { isDateOnly, localDayBounds, parseInstant, shiftDate } from '@/shared/utils/local-date';
import type { AgendaEventEntity, CreateAgendaInput } from './entities/agenda.entity';

export function allDayDates(start: string, end: string) {
  // Legacy forms stored UTC midnight / 23:59:59 for a calendar day, not a travelling instant.
  const first = start.slice(0, 10);
  const last = isDateOnly(end) || /[T ]00:00:00(?:\.0{1,3})?(?:Z|[+-]\d{2}:\d{2})?$/.test(end) ? end.slice(0, 10) : shiftDate(end.slice(0, 10), 1);
  if (!isDateOnly(first) || !isDateOnly(last) || last <= first) throw new Error('Rentang tanggal agenda sepanjang hari tidak valid.');
  return { start: first, end: last };
}

export function validateAgenda(input: CreateAgendaInput): CreateAgendaInput {
  if (typeof input.title !== 'string' || !input.title.trim()) throw new Error('Judul agenda wajib diisi.');
  if (input.eventType !== undefined && !['WORK', 'MEETING', 'PERSONAL', 'LEARNING'].includes(input.eventType)) throw new Error('Kategori agenda tidak dikenal.');
  if (input.reminderMinutes !== undefined && input.reminderMinutes !== null && (!Number.isSafeInteger(input.reminderMinutes) || input.reminderMinutes < 0)) throw new Error('Pengingat harus nonaktif, 0, atau jumlah menit positif.');
  if (input.isAllDay) {
    if (!isDateOnly(input.startTime) || !isDateOnly(input.endTime) || input.endTime <= input.startTime) throw new Error('Agenda sepanjang hari memakai tanggal awal dan akhir eksklusif yang valid.');
    return { ...input, title: input.title.trim(), reminderMinutes: null };
  }
  const start = parseInstant(input.startTime), end = parseInstant(input.endTime);
  if (end <= start) throw new Error('Waktu selesai harus setelah waktu mulai. Untuk lintas malam, pilih selesai besok.');
  return { ...input, title: input.title.trim(), startTime: start.toISOString(), endTime: end.toISOString() };
}

export function occursOnDate(event: Pick<AgendaEventEntity, 'isAllDay' | 'startTime' | 'endTime'>, date: string): boolean {
  if (event.isAllDay) { const range = allDayDates(event.startTime, event.endTime); return range.start <= date && range.end > date; }
  const { start, end } = localDayBounds(date);
  return parseInstant(event.startTime) < end && parseInstant(event.endTime) > start;
}

export function reminderTrigger(event: Pick<AgendaEventEntity, 'isAllDay' | 'isCompleted' | 'reminderMinutes' | 'startTime'>): number | null {
  if (event.isAllDay || event.isCompleted || event.reminderMinutes === null) return null;
  return parseInstant(event.startTime).getTime() - event.reminderMinutes * 60_000;
}

export function conflictingEventIds(events: AgendaEventEntity[]): Set<string> {
  const timed = events.filter(event => !event.isAllDay && !event.isCompleted).map(event => ({ id: event.id, start: parseInstant(event.startTime).getTime(), end: parseInstant(event.endTime).getTime() })).sort((a, b) => a.start - b.start);
  const ids = new Set<string>();
  let latest: typeof timed[number] | undefined;
  for (const event of timed) {
    if (latest && event.start < latest.end) { ids.add(latest.id); ids.add(event.id); }
    if (!latest || event.end > latest.end) latest = event;
  }
  return ids;
}
