import { isDateOnly, isTimeOnly, parseInstant } from '@/shared/utils/local-date';
import type { ManagedTaskEntity } from './entities/managed-task.entity';

export const MANAGED_TASKS_KEY = 'managed_tasks_v1';

function invalid(field: string): never {
  throw new Error('Data tugas terjadwal tidak valid: ' + field + '.');
}

export function validateManagedTaskTiming(input: {
  executionDate: unknown; executionTime: unknown; deadlineDate: unknown; deadlineTime: unknown;
}): void {
  if (typeof input.executionDate !== 'string' || !isDateOnly(input.executionDate)) invalid('tanggal pengerjaan harus YYYY-MM-DD dan benar pada kalender');
  if (typeof input.deadlineDate !== 'string' || !isDateOnly(input.deadlineDate)) invalid('tanggal deadline harus YYYY-MM-DD dan benar pada kalender');
  if (!isTimeOnly(input.executionTime)) invalid('jam pengerjaan harus HH:mm antara 00:00 dan 23:59');
  if (!isTimeOnly(input.deadlineTime)) invalid('jam deadline harus HH:mm antara 00:00 dan 23:59');
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function instant(value: unknown, field: string, nullable = false): void {
  if (nullable && value === null) return;
  if (typeof value !== 'string') invalid(field);
  try { parseInstant(value); } catch { invalid(field); }
}

export function validateManagedTask(value: unknown): asserts value is ManagedTaskEntity {
  if (!record(value)) invalid('catatan harus berupa objek');
  for (const field of ['id', 'title', 'alarmTrackId', 'alarmTrackName']) {
    if (typeof value[field] !== 'string' || !value[field].trim()) invalid(field);
  }
  if (typeof value.courseOrContext !== 'string') invalid('courseOrContext');
  for (const field of ['notes', 'alarmTrackUri', 'lastAlarmFiredKey']) {
    if (value[field] !== null && typeof value[field] !== 'string') invalid(field);
  }
  if (typeof value.categoryType !== 'string' || !['COLLEGE', 'WORK', 'PROJECT', 'PERSONAL'].includes(value.categoryType)) invalid('kategori');
  if (typeof value.priority !== 'string' || !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value.priority)) invalid('prioritas');
  if (typeof value.alertMode !== 'string' || !['ALARM', 'NOTIFICATION', 'BOTH', 'NONE'].includes(value.alertMode)) invalid('mode pengingat');
  if (typeof value.estimatedMinutes !== 'number' || !Number.isSafeInteger(value.estimatedMinutes) || value.estimatedMinutes < 0) invalid('estimasi menit');
  if (typeof value.snoozeMinutes !== 'number' || !Number.isSafeInteger(value.snoozeMinutes) || value.snoozeMinutes <= 0) invalid('durasi tunda');
  if (typeof value.autoAddToToday !== 'boolean' || typeof value.isCompleted !== 'boolean') invalid('status boolean');
  validateManagedTaskTiming({ executionDate: value.executionDate, executionTime: value.executionTime,
    deadlineDate: value.deadlineDate, deadlineTime: value.deadlineTime });
  instant(value.createdAt, 'createdAt'); instant(value.updatedAt, 'updatedAt');
  instant(value.completedAt, 'completedAt', true); instant(value.snoozedUntilIso, 'snoozedUntilIso', true);
  if (!Array.isArray(value.subtasks)) invalid('langkah tugas');
  const subtaskIds = new Set<string>();
  for (const subtask of value.subtasks) {
    if (!record(subtask) || typeof subtask.id !== 'string' || !subtask.id.trim() || subtaskIds.has(subtask.id)
      || typeof subtask.title !== 'string' || !subtask.title.trim() || typeof subtask.isCompleted !== 'boolean') invalid('langkah tugas');
    subtaskIds.add(subtask.id);
  }
  // Missing exclusions are valid in backups created before per-day priority opt-out.
  if (value.excludedFocusDates !== undefined) {
    if (!Array.isArray(value.excludedFocusDates)) invalid('tanggal pengecualian prioritas');
    const dates = new Set<string>();
    for (const date of value.excludedFocusDates) {
      if (typeof date !== 'string' || !isDateOnly(date) || dates.has(date)) invalid('tanggal pengecualian prioritas');
      dates.add(date);
    }
  }
}

export function parseManagedTasks(json: string): ManagedTaskEntity[] {
  let value: unknown;
  try { value = JSON.parse(json); } catch { return invalid('JSON tidak dapat dibaca'); }
  if (!Array.isArray(value)) invalid('daftar tugas');
  const ids = new Set<string>();
  for (const task of value) {
    validateManagedTask(task);
    if (ids.has(task.id)) invalid('ID tugas duplikat');
    ids.add(task.id);
  }
  return value;
}
