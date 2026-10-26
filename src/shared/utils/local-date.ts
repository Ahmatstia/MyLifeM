/** Date-only keys follow the device calendar, not the UTC date. */
export function formatLocalDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function shiftDate(value: string, days: number): string {
  if (!isDateOnly(value)) throw new Error('Tanggal harus valid dalam format TTTT-BB-HH.');
  const date = new Date(value + 'T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function localDayBounds(value: string) {
  if (!isDateOnly(value)) throw new Error('Tanggal tidak valid.');
  const start = new Date(value + 'T00:00:00');
  const end = new Date(shiftDate(value, 1) + 'T00:00:00');
  if (formatLocalDate(start) !== value) throw new Error('Tanggal ini tidak tersedia pada zona waktu perangkat.');
  return { start, end };
}

/** Offset-less legacy timestamps follow the current device zone; their original zone was never stored. */
export function parseInstant(value: string): Date {
  const match = typeof value === 'string' && /^(\d{4}-\d{2}-\d{2})[T ]([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,3})?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?$/.exec(value);
  if (!match || !isDateOnly(match[1])) throw new Error('Tanggal atau jam tidak valid.');
  const date = new Date(value.replace(' ', 'T'));
  if (!Number.isFinite(date.getTime()) || (!match[5] && (formatLocalDate(date) !== match[1] || date.getHours() !== Number(match[2]) || date.getMinutes() !== Number(match[3])))) throw new Error('Jam ini tidak tersedia pada zona waktu perangkat.');
  return date;
}

export function localTimeToIso(date: string, time: string): string {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!match) throw new Error('Jam harus valid, misalnya 09:00 atau 23:30.');
  return parseInstant(`${date}T${match[1].padStart(2, '0')}:${match[2]}:00`).toISOString();
}
