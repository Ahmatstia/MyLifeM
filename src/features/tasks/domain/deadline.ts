import { formatLocalDate, localTimeToIso } from '@/shared/utils/local-date';
/** A date-only deadline remains valid throughout that local calendar day. */
export function isTaskOverdue(date: string | null, time: string | null | undefined, status: string, now = new Date()) {
  if (!date || ['COMPLETED','CANCELLED'].includes(status)) return false;
  return time ? now.getTime() > Date.parse(localTimeToIso(date,time)) : formatLocalDate(now) > date;
}
