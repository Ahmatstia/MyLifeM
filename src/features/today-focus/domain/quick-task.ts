export const QUICK_TASK_CATEGORIES = ['Belajar', 'Kesehatan', 'Kerja', 'Hobi'] as const;
export type QuickTaskCategory = typeof QUICK_TASK_CATEGORIES[number];
export const QUICK_TASK_DETAILS_PREFIX = 'quick_task_details_v1:';
export interface QuickTaskOptions { estimatedMinutes?: number; category?: QuickTaskCategory; }
export interface QuickTaskDetails { category: QuickTaskCategory | null; focusMinutes: number | null; }

export function validateQuickTaskOptions(options: QuickTaskOptions): void {
  if (options.estimatedMinutes !== undefined && (!Number.isSafeInteger(options.estimatedMinutes) || options.estimatedMinutes < 1 || options.estimatedMinutes > 1440)) {
    throw new Error('Durasi tugas harus berupa menit bulat antara 1 dan 1440.');
  }
  if (options.category !== undefined && !QUICK_TASK_CATEGORIES.some(category => category === options.category)) throw new Error('Kategori tugas cepat tidak dikenal.');
}

export function parseQuickTaskDetails(value: string): QuickTaskDetails {
  try {
    const details = JSON.parse(value);
    if (!details || Array.isArray(details) || typeof details !== 'object' || Object.keys(details).length !== 2
      || !Object.hasOwn(details, 'category') || !Object.hasOwn(details, 'focusMinutes')) throw new Error();
    validateQuickTaskOptions({ ...(details.category === null ? {} : { category: details.category }),
      ...(details.focusMinutes === null ? {} : { estimatedMinutes: details.focusMinutes }) });
    return details;
  } catch { throw new Error('Data kategori/durasi tugas cepat tidak valid.'); }
}
