import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, AppText, FormScreenHeader, Button } from '@/shared/ui';
import { backOrHome } from '@/shared/utils/back-or-home';
import { todayColors as c } from '@/theme/today';
import { useNotificationStore } from '@/shared/notifications/notification-store';
import { syncCalendarReminders } from '@/features/agenda/data/services/calendar-reminder.service';
import { AgendaNotificationService } from '@/features/agenda/data/services/agenda-notification.service';
import { TaskAlarmNotificationService } from '@/features/task-manager/data/services/task-alarm-notification.service';
import { managedTaskRepository } from '@/features/task-manager/data/repositories/managed-task.repository';
import { WEEKLY_REMINDER_DAYS } from '@/features/agenda/domain/weekly-reminders';

export default function ReminderStatusScreen() {
  const { kind, notice } = useLocalSearchParams<{ kind?: string; notice?: string }>();
  const isTask = kind === 'tasks';
  const item = useNotificationStore(state => state.notices.find(item => item.id === notice || item.id === (isTask ? 'task-reminders' : 'calendar-reminders')));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const retry = async () => {
    if (busy) return;
    setBusy(true); setFeedback('');
    try {
      let ready: boolean;
      if (isTask) { await TaskAlarmNotificationService.requestExactAlarmPermission(); await managedTaskRepository.syncAlarms(true); ready = !useNotificationStore.getState().notices.some(item => item.id === 'task-reminders'); }
      else { await AgendaNotificationService.requestExactAlarmPermission(); ready = await syncCalendarReminders(true); }
      setFeedback(ready ? 'Pengingat sudah diperbarui.' : 'Pengingat belum sepenuhnya aktif. Periksa izin notifikasi dan alarm tepat waktu di pengaturan perangkat. Pada web, pengingat perangkat belum tersedia.');
    } catch { setFeedback('Pengingat belum dapat diperiksa. Coba lagi.'); }
    finally { setBusy(false); }
  };
  return <Screen style={{ backgroundColor: c.paper }}>
    <FormScreenHeader title={isTask ? 'Pengingat tugas' : 'Pengingat kalender'} onBack={backOrHome} rightAction={null} />
    <View style={{ backgroundColor: c.goldSoft, borderRadius: 24, padding: 20, gap: 12 }}>
      <AppText variant="headlineSmall" color={c.ink}>{item ? 'Perlu diperiksa' : 'Tentang pengingat'}</AppText>
      <AppText color={c.ink}>{item?.message ?? 'Status pengingat diperbarui saat aplikasi dibuka atau jadwal berubah.'}</AppText>
    </View>
    {!isTask && <AppText color={c.muted}>Pengingat disiapkan untuk {WEEKLY_REMINDER_DAYS} hari ke depan, maksimal 50 pengingat kalender terdekat. Buka aplikasi secara berkala untuk memperbaruinya.</AppText>}
    {isTask && <AppText color={c.muted}>Lagu dan layar alarm tersedia saat aplikasi aktif. Di latar belakang, pengingat memakai suara notifikasi perangkat. Ketuk notifikasi untuk membuka tugas.</AppText>}
    <AppText color={c.muted}>Jadwal tetap tersimpan. Ketepatan pengingat mengikuti izin notifikasi, izin alarm tepat waktu, dan pembatasan baterai perangkat.</AppText>
    <Button title={busy ? 'Memeriksa…' : 'Periksa izin pengingat'} disabled={busy} onPress={retry} />
    {feedback ? <AppText accessibilityLiveRegion="polite" color={c.ink}>{feedback}</AppText> : null}
    <Button title={isTask ? 'Buka manajemen tugas' : 'Buka kalender'} variant="outlined" onPress={() => router.navigate(isTask ? '/task-manager' : '/(tabs)/agenda')} />
  </Screen>;
}
