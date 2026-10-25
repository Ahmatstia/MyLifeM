import { getTableColumns, getTableName } from 'drizzle-orm';
import * as schema from '@/db/schema';

export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export const MAX_BACKUP_ROWS = 50_000;
export const BACKUP_TABLES = {
  categories: schema.categories,
  lifePillars: schema.lifePillars,
  targets: schema.targets,
  projects: schema.projects,
  stages: schema.stages,
  milestones: schema.milestones,
  tasks: schema.tasks,
  dailyFocusItems: schema.dailyFocusItems,
  focusSessions: schema.focusSessions,
  agendaEvents: schema.agendaEvents,
  userSettings: schema.userSettings,
} as const;
export type BackupTable = keyof typeof BACKUP_TABLES;
export type BackupRow = Record<string, string | number | null>;
export type BackupData = { [Key in BackupTable]: (typeof BACKUP_TABLES)[Key]['$inferSelect'][] };
export interface BackupDocument {
  format: 'mylife-backup';
  formatVersion: 1;
  schemaVersion: 2;
  exportedAt: string;
  data: BackupData;
}

export const TABLE_SPECS = Object.entries(BACKUP_TABLES).map(([key, table]) => ({
  key: key as BackupTable,
  name: getTableName(table),
  primaryKey: key === 'userSettings' ? 'key' : 'id',
  columns: Object.entries(getTableColumns(table)).map(([key, column]) => ({
    key, name: column.name, type: column.dataType, notNull: column.notNull,
    integer: column.columnType === 'SQLiteInteger',
  })),
}));

function invalid(message: string): never {
  throw new Error('Cadangan tidak valid: ' + message);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function dateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function dateText(value: string): boolean {
  if (dateOnly(value)) return true;
  return /^\d{4}-\d{2}-\d{2}[T ](?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?$/.test(value)
    && dateOnly(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

export function checkBackupSize(bytes: number): void {
  if (!Number.isFinite(bytes) || bytes < 1 || bytes > MAX_BACKUP_BYTES) {
    throw new Error('Berkas cadangan harus berukuran 1 byte sampai 10 MB.');
  }
}

export function serializeBackup(data: BackupData): string {
  if (TABLE_SPECS.reduce((sum, spec) => sum + data[spec.key].length, 0) > MAX_BACKUP_ROWS) invalid('maksimal 50.000 catatan per cadangan.');
  const json = JSON.stringify({ format: 'mylife-backup', formatVersion: 1, schemaVersion: 2,
    exportedAt: new Date().toISOString(), data } satisfies BackupDocument, null, 2);
  checkBackupSize(new Blob([json]).size);
  return json;
}

export function parseBackup(json: string): BackupDocument {
  // shortcut: bounded JSON is read in memory; use streaming before backups exceed 10 MB / 50k rows.
  if (json.length > MAX_BACKUP_BYTES) checkBackupSize(json.length);
  checkBackupSize(new Blob([json]).size);
  let input: unknown;
  try { input = JSON.parse(json.replace(/^\uFEFF/, '')); } catch { return invalid('berkas bukan JSON yang dapat dibaca.'); }
  if (record(input) && input.format === 'mylife-migration-snapshot') return parseMigrationArchive(input);
  if (!record(input) || input.format !== 'mylife-backup' || input.formatVersion !== 1 || (input.schemaVersion !== 1 && input.schemaVersion !== 2)) {
    return invalid('format/versi tidak didukung. Snapshot lama tanpa kategori dan tahapan tidak dapat dipulihkan.');
  }
  if (typeof input.exportedAt !== 'string' || !dateText(input.exportedAt) || !record(input.data)) return invalid('metadata tidak lengkap.');
  if (input.schemaVersion === 1) {
    upgradeLegacyBackup(input.data);
    input.schemaVersion = 2;
  }
  const data = input.data;
  const allowed = Object.keys(BACKUP_TABLES);
  if (Object.keys(data).length !== allowed.length || Object.keys(data).some(key => !Object.hasOwn(BACKUP_TABLES, key))) return invalid('harus memuat tepat 11 tabel aplikasi.');
  const ids = new Map<BackupTable, Map<string, BackupRow>>();
  let count = 0;
  for (const spec of TABLE_SPECS) {
    const rows = data[spec.key];
    if (!Array.isArray(rows)) return invalid(spec.key + ' harus berupa daftar.');
    count += rows.length;
    if (count > MAX_BACKUP_ROWS) return invalid('maksimal 50.000 catatan per cadangan.');
    const rowIds = new Map<string, BackupRow>();
    for (const row of rows) {
      if (!record(row) || Object.keys(row).length !== spec.columns.length || Object.keys(row).some(key => !spec.columns.some(column => column.key === key))) return invalid('kolom ' + spec.key + ' tidak sesuai versi skema.');
      for (const column of spec.columns) {
        const value = row[column.key];
        const location = spec.key + '.' + column.key;
        if (value === null && !column.notNull) continue;
        if (column.type === 'string' ? typeof value !== 'string' : typeof value !== 'number' || !Number.isFinite(value) || (column.integer && !Number.isInteger(value))) return invalid('tipe nilai ' + location + ' tidak sesuai.');
        if (typeof value === 'number' && !Number.isSafeInteger(value) && column.integer) return invalid(location + ' di luar batas angka aman.');
        if (/^(isCompleted|isAllDay)$/.test(column.key) && value !== 0 && value !== 1) return invalid(location + ' harus 0 atau 1.');
        if (typeof value === 'string' && /(?:At|Date|Time)$/.test(column.key) && !dateText(value)) return invalid('tanggal ' + location + ' tidak benar.');
      }
      const id = row[spec.primaryKey];
      const label = row.title ?? row.name;
      if (typeof label === 'string' && !label.trim()) return invalid('judul/nama kosong pada ' + spec.key + '.');
      if (typeof id !== 'string' || !id.trim() || rowIds.has(id)) return invalid('ID kosong/duplikat pada ' + spec.key + '.');
      rowIds.set(id, row as BackupRow);
    }
    ids.set(spec.key, rowIds);
  }
  const typed = data as BackupData;
  const ref = (row: BackupRow, field: string, target: BackupTable) => {
    const value = row[field];
    if (value !== null && !ids.get(target)!.has(String(value))) invalid('catatan ' + String(row.id) + ': ' + field + ' merujuk ' + target + ' yang tidak ada.');
  };
  const choice = (row: BackupRow, field: string, options: string[]) => {
    if (!options.includes(String(row[field]))) invalid(field + ' tidak dikenal.');
  };
  const nonnegative = (row: BackupRow, fields: string[]) => {
    for (const field of fields) if (row[field] !== null && Number(row[field]) < 0) invalid(field + ' tidak boleh negatif.');
  };
  for (const row of typed.targets) {
    ref(row, 'categoryId', 'categories'); ref(row, 'pillarId', 'lifePillars');
    choice(row, 'status', ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']);
    choice(row, 'type', ['MILESTONE_BASED', 'NUMERIC', 'MAINTENANCE']);
    choice(row, 'priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
  }
  for (const row of typed.projects) { ref(row, 'targetId', 'targets'); choice(row, 'status', ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']); choice(row, 'priority', ['LOW', 'MEDIUM', 'HIGH']); }
  for (const row of typed.stages) {
    choice(row, 'parentType', ['TARGET', 'PROJECT']);
    ref(row, 'parentId', row.parentType === 'TARGET' ? 'targets' : 'projects');
    if (row.parentType === 'TARGET' ? row.targetId !== row.parentId || row.projectId !== null : row.projectId !== row.parentId || row.targetId !== null) return invalid('relasi tahapan tidak sesuai induknya.');
  }
  for (const row of typed.milestones) ref(row, 'projectId', 'projects');
  for (const row of typed.tasks) {
    ref(row, 'stageId', 'stages'); ref(row, 'projectId', 'projects'); ref(row, 'targetId', 'targets'); ref(row, 'milestoneId', 'milestones');
    if (row.projectId !== null && row.targetId !== null) return invalid('tugas harus memiliki satu pemilik.');
    choice(row, 'status', ['TODO', 'IN_PROGRESS', 'COMPLETED', 'DONE', 'CANCELLED']);
    choice(row, 'priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
    nonnegative(row, ['estimatedHours', 'estimatedMinutes', 'actualMinutes']);
    const stage = row.stageId === null ? undefined : ids.get('stages')!.get(String(row.stageId));
    if (stage && (stage.parentType === 'TARGET' ? row.targetId !== stage.parentId : row.projectId !== stage.parentId)) return invalid('pemilik tugas berbeda dari tahapannya.');
    if (row.projectId !== null && row.targetId !== null && ids.get('projects')!.get(String(row.projectId))!.targetId !== row.targetId) return invalid('target tugas berbeda dari target proyek.');
    if (row.milestoneId !== null && ids.get('milestones')!.get(String(row.milestoneId))!.projectId !== row.projectId) return invalid('milestone tugas berasal dari proyek lain.');
  }
  const focusKeys = new Set<string>();
  for (const row of typed.dailyFocusItems) {
    ref(row, 'taskId', 'tasks');
    if (!dateOnly(String(row.date))) return invalid('tanggal prioritas harus YYYY-MM-DD.');
    const key = JSON.stringify([row.date, row.taskId]);
    if (focusKeys.has(key)) return invalid('tugas prioritas duplikat pada tanggal yang sama.');
    focusKeys.add(key);
  }
  for (const row of typed.focusSessions) {
    ref(row, 'taskId', 'tasks'); choice(row, 'mode', ['POMODORO', 'DEEP_FLOW', 'STOPWATCH']);
    nonnegative(row, ['durationMinutes']);
    if (row.rating !== null && (Number(row.rating) < 1 || Number(row.rating) > 5)) return invalid('rating fokus harus 1–5.');
    if (row.endedAt !== null && Date.parse(String(row.endedAt)) < Date.parse(String(row.startedAt))) return invalid('waktu selesai sesi mendahului mulai.');
  }
  for (const row of typed.agendaEvents) {
    ref(row, 'targetId', 'targets'); ref(row, 'projectId', 'projects'); ref(row, 'taskId', 'tasks');
    choice(row, 'eventType', ['WORK', 'PERSONAL', 'LEARNING', 'MEETING']);
    if (!String(row.title).trim() || Date.parse(String(row.endTime)) <= Date.parse(String(row.startTime))) return invalid('judul/rentang waktu agenda tidak benar.');
    nonnegative(row, ['reminderMinutes']);
  }
  const names = new Set<string>();
  for (const row of typed.categories) {
    const name = String(row.name).trim().toLocaleLowerCase('id-ID');
    if (!name || names.has(name)) return invalid('nama kategori kosong/duplikat.');
    names.add(name);
  }
  for (const row of typed.userSettings) {
    if (row.key === 'pomodoro_minutes' || row.key === 'deep_flow_minutes') {
      if (!/^\d+$/.test(String(row.value)) || Number(row.value) < 1 || Number(row.value) > 1440) return invalid('durasi pengaturan harus 1–1440 menit.');
    }
    if ((row.key === 'haptics_enabled' || row.key === 'keep_awake_enabled') && row.value !== 'true' && row.value !== 'false') return invalid('preferensi harus true/false.');
  }
  return input as unknown as BackupDocument;
}

/** Only converts relationships that are unambiguous in the previous complete format. */
export function upgradeLegacyBackup(data: Record<string, unknown>): void {
  if (!Array.isArray(data.stages) || !Array.isArray(data.tasks) || !Array.isArray(data.projects) || !Array.isArray(data.focusSessions)) return invalid('tabel legacy tidak lengkap.');
  for (const stage of data.stages) {
    if (!record(stage) || Object.hasOwn(stage, 'targetId') || Object.hasOwn(stage, 'projectId')) return invalid('kolom tahapan legacy tidak sesuai.');
    stage.targetId = stage.parentType === 'TARGET' ? stage.parentId : null;
    stage.projectId = stage.parentType === 'PROJECT' ? stage.parentId : null;
  }
  for (const task of data.tasks) {
    if (!record(task)) return invalid('tugas legacy tidak sesuai.');
    if (task.projectId !== null && task.targetId !== null && data.projects.some(project => record(project) && project.id === task.projectId && project.targetId === task.targetId)) task.targetId = null;
  }
  for (const session of data.focusSessions) {
    if (!record(session) || Object.hasOwn(session, 'taskTitle')) return invalid('kolom sesi legacy tidak sesuai.');
    const task = data.tasks.find(task => record(task) && task.id === session.taskId);
    session.taskTitle = record(task) && typeof task.title === 'string' ? task.title : null;
  }
}

/** Import only row values from a pre-upgrade archive; archived SQL is never executed. */
function parseMigrationArchive(input: Record<string, unknown>): BackupDocument {
  if (input.version !== 0 || !Array.isArray(input.tables) || typeof input.capturedAt !== 'string' || !dateText(input.capturedAt)) return invalid('versi/metadata arsip pra-migrasi tidak didukung.');
  const tables = new Map<string, Record<string, unknown>[]>();
  for (const table of input.tables) {
    if (!record(table) || typeof table.name !== 'string' || tables.has(table.name) || !TABLE_SPECS.some(spec => spec.name === table.name) || !Array.isArray(table.rows) || table.rows.some(row => !record(row))) return invalid('tabel arsip pra-migrasi tidak sesuai.');
    tables.set(table.name, table.rows);
  }
  const data = Object.fromEntries(TABLE_SPECS.map(spec => {
    const columns = spec.columns.filter(column => !(spec.key === 'stages' && ['targetId', 'projectId'].includes(column.key)) && !(spec.key === 'focusSessions' && column.key === 'taskTitle'));
    const defaults: Record<string, unknown> = { categoryId: null, stageId: null, name: null, estimatedHours: 1, sortOrder: 0 };
    return [spec.key, (tables.get(spec.name) ?? []).map(row => {
      if (Object.keys(row).some(name => !columns.some(column => column.name === name))) return invalid('kolom legacy belum dikenal pada ' + spec.name + '.');
      return Object.fromEntries(columns.map(column => [column.key, Object.hasOwn(row, column.name) ? row[column.name] : defaults[column.key]]));
    })];
  }));
  return parseBackup(JSON.stringify({ format: 'mylife-backup', formatVersion: 1, schemaVersion: 1, exportedAt: input.capturedAt, data }));
}

export function summarizeBackup(backup: BackupDocument) {
  return { exportedAt: backup.exportedAt, total: TABLE_SPECS.reduce((sum, spec) => sum + backup.data[spec.key].length, 0),
    targets: backup.data.targets.length, projects: backup.data.projects.length, tasks: backup.data.tasks.length,
    stages: backup.data.stages.length, categories: backup.data.categories.length,
    sessions: backup.data.focusSessions.length, agenda: backup.data.agendaEvents.length };
}
