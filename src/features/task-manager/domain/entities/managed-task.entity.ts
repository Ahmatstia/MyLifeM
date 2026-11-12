/**
 * Managed Task (Manajemen Tugas & Eksekusi Terjadwal) Domain Entity
 * Dirancang untuk mahasiswa, pekerja, dan umum dengan konsep Dual-Date:
 * 1. Jadwal Eksekusi (Do-Date / Kapan Dikerjakan) -> memicu Alarm Berisik / Notifikasi & Auto-Sync ke Hari Ini
 * 2. Batas Akhir (Deadline Pengumpulan) -> indikator keamanan buffer waktu
 */

export type TaskAlertMode = 'ALARM' | 'NOTIFICATION' | 'BOTH' | 'NONE';

export type TaskCategoryType = 'COLLEGE' | 'WORK' | 'PROJECT' | 'PERSONAL';

export type ManagedTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ManagedTaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CustomAlarmTrack {
  id: string;
  name: string;
  uri: string;
  isBuiltIn: boolean;
  description?: string;
}

export interface ManagedTaskEntity {
  id: string;
  title: string;
  courseOrContext: string;
  categoryType: TaskCategoryType;
  notes: string | null;
  priority: ManagedTaskPriority;
  estimatedMinutes: number;

  // Dual-Date System: Kapan Dikerjakan (Execution) vs Kapan Dikumpulkan (Deadline)
  executionDate: string; // 'YYYY-MM-DD'
  executionTime: string; // 'HH:mm'
  deadlineDate: string;  // 'YYYY-MM-DD'
  deadlineTime: string;  // 'HH:mm'

  // Alarm & Notification Engine
  alertMode: TaskAlertMode;
  alarmTrackId: string;
  alarmTrackName: string;
  alarmTrackUri: string | null;
  snoozeMinutes: number;
  snoozedUntilIso: string | null;
  lastAlarmFiredKey: string | null;

  // Integration & Subtasks
  autoAddToToday: boolean;
  subtasks: ManagedTaskSubtask[];
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManagedTaskInput {
  title: string;
  courseOrContext?: string;
  categoryType?: TaskCategoryType;
  notes?: string;
  priority?: ManagedTaskPriority;
  estimatedMinutes?: number;
  executionDate: string;
  executionTime: string;
  deadlineDate: string;
  deadlineTime: string;
  alertMode: TaskAlertMode;
  alarmTrackId: string;
  alarmTrackName: string;
  alarmTrackUri?: string | null;
  snoozeMinutes?: number;
  autoAddToToday?: boolean;
  subtasks?: string[];
}

export type DeadlineBufferTone = 'safe' | 'tight' | 'critical' | 'overdue' | 'done';

export interface DeadlineBufferInfo {
  tone: DeadlineBufferTone;
  label: string;
  daysBeforeDeadline: number;
}

export const BUILT_IN_ALARM_TRACKS: CustomAlarmTrack[] = [
  {
    id: 'builtin-siren-energize',
    name: 'Sirine Ekspedisi (Kencang & Berisik)',
    uri: 'builtin://siren-energize',
    isBuiltIn: true,
    description: 'Nada alarm cepat & nyaring agar langsung bangun dan fokus',
  },
  {
    id: 'builtin-digital-pulse',
    name: 'Digital Pulse (Beep Akademik)',
    uri: 'builtin://digital-pulse',
    isBuiltIn: true,
    description: 'Ritme alarm jam meja klasik yang tegas dan konsisten',
  },
  {
    id: 'builtin-morning-chime',
    name: 'Harmoni Pagi (Melodi Fokus)',
    uri: 'builtin://morning-chime',
    isBuiltIn: true,
    description: 'Nada bertingkat yang membangunkan fokus secara bertahap',
  },
];

function parseDateMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y || 2026, (m || 1) - 1, d || 1);
}

/**
 * Menghitung jarak aman antara Jadwal Pengerjaan (executionDate) dan Deadline (deadlineDate).
 */
export function computeDeadlineBufferInfo(
  task: Pick<
    ManagedTaskEntity,
    'executionDate' | 'deadlineDate' | 'isCompleted'
  >,
  todayDate: string
): DeadlineBufferInfo {
  if (task.isCompleted) {
    return {
      tone: 'done',
      label: 'Tugas Tuntas',
      daysBeforeDeadline: 0,
    };
  }

  const execMs = parseDateMs(task.executionDate);
  const deadlineMs = parseDateMs(task.deadlineDate);
  const todayMs = parseDateMs(todayDate);

  const daysBeforeDeadline = Math.round((deadlineMs - execMs) / 86_400_000);
  const daysToDeadlineFromToday = Math.round((deadlineMs - todayMs) / 86_400_000);

  if (daysToDeadlineFromToday < 0) {
    return {
      tone: 'overdue',
      label: `Terlewat Deadline (${Math.abs(daysToDeadlineFromToday)} hari lalu)`,
      daysBeforeDeadline,
    };
  }

  if (daysBeforeDeadline >= 2) {
    return {
      tone: 'safe',
      label: `Aman · Dikerjakan H-${daysBeforeDeadline} sebelum deadline`,
      daysBeforeDeadline,
    };
  }

  if (daysBeforeDeadline === 1) {
    return {
      tone: 'tight',
      label: 'Cukup Dekat · Dikerjakan H-1 sebelum deadline',
      daysBeforeDeadline,
    };
  }

  if (daysBeforeDeadline === 0) {
    return {
      tone: 'critical',
      label: 'Mepet · Dikerjakan tepat di hari deadline!',
      daysBeforeDeadline,
    };
  }

  return {
    tone: 'overdue',
    label: 'Jadwal eksekusi melewati tanggal deadline!',
    daysBeforeDeadline,
  };
}

const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const INDONESIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function formatDayAndDateIndo(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const dt = new Date(year, month, day);
  if (Number.isNaN(dt.getTime())) return dateStr;
  const dayName = INDONESIAN_DAYS[dt.getDay()] ?? '';
  const monthName = INDONESIAN_MONTHS_SHORT[month] ?? '';
  return `${dayName}, ${day} ${monthName}`;
}

