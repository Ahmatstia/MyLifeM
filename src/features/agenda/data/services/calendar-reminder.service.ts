import { agendaRepository } from '../repositories/agenda.repository.impl';
import { weeklyScheduleRepository } from '../repositories/weekly-schedule.repository.impl';
import { AgendaNotificationService } from './agenda-notification.service';

let warning: string | null = null;
const listeners = new Set<(value: string | null) => void>();
export function subscribeCalendarReminderStatus(listener: (value: string | null) => void): () => void {
  listeners.add(listener); listener(warning);
  return () => { listeners.delete(listener); };
}

export async function syncCalendarReminders(askPermission = false): Promise<boolean> {
  let ready = false;
  try {
    ready = await AgendaNotificationService.reconcileReminders(async () => {
      const [agenda, weekly] = await Promise.all([agendaRepository.getReminderEvents(), weeklyScheduleRepository.getReminderEvents()]);
      return [...agenda, ...weekly];
    }, askPermission);
  } catch { /* Native work cannot turn a committed save into a failed save. */ }
  warning = ready ? null : 'Jadwal tetap tersimpan. Sebagian pengingat belum aktif atau dapat terlambat. Periksa izin notifikasi/alarm tepat waktu dan dukungan perangkat. Maksimal 50 pengingat terdekat dijadwalkan; web belum mendukung pengingat.';
  for (const listener of listeners) {
    try { listener(warning); } catch { /* One stale listener must not affect saved data or other screens. */ }
  }
  return ready;
}
