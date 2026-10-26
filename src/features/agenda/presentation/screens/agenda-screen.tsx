import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space } from '@/theme/tokens';
import { Screen, ScreenHeader, AppText, Button, Banner, EmptyState } from '@/shared/ui';
import { useAgenda } from '../hooks/use-agenda';
import { DateStripHeader } from '../components/date-strip-header';
import { TimelineEventCard } from '../components/timeline-event-card';
import { AddEventModal } from '../components/add-event-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { conflictingEventIds } from '../../domain/agenda-time';

export const AgendaScreen: React.FC = () => {
  const { selectedDate, setSelectedDate, todayDate, timeZone, events, isLoading, error, reminderWarning, retryReminders, refresh, addEvent, toggleEvent, removeEvent } = useAgenda();
  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));
  const allDay = events.filter(event => event.isAllDay);
  const timed = events.filter(event => !event.isAllDay);
  const conflicts = conflictingEventIds(events);
  const handleDelete = (id: string, title: string) => {
    Alert.alert('Hapus agenda?', title, [{ text: 'Batal', style: 'cancel' },
      { text: 'Hapus agenda', style: 'destructive', onPress: () => removeEvent(id) }]);
  };

  return (
    <Screen>
      <ScreenHeader title="Ritme harimu." subtitle="Agenda & jadwal"
        action={<Button title="+ Agenda" size="compact" onPress={() => setIsModalVisible(true)} />} />
      <DateStripHeader selectedDate={selectedDate} todayDate={todayDate} onSelectDate={setSelectedDate} />
      <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.note}>Zona waktu perangkat: {timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}</AppText>
      {reminderWarning && <Banner variant="warning" message={reminderWarning} actionText="Periksa izin pengingat" onActionPress={retryReminders} style={styles.notice} />}
      {!isLoading && !error && conflicts.size > 0 && <Banner variant="info" message="Ada agenda dengan waktu bertumpuk. Jadwal tetap disimpan; sesuaikan jika diperlukan." style={styles.notice} />}
      {error && <Banner variant="error" message={error} actionText="Coba lagi" onActionPress={refresh} style={styles.notice} />}
      {isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><AppText color="onSurfaceVariant">Memuat agenda…</AppText></View> : !error && (
        events.length === 0 ? <EmptyState title="Masih ada ruang di harimu"
          description="Jadwalkan kegiatan penting, waktu belajar, atau jeda untuk dirimu."
          customIcon={<Calendar size={32} color={colors.onPrimaryContainer} />}
          actionTitle="Jadwalkan kegiatan" onActionPress={() => setIsModalVisible(true)} /> :
          <>
            {allDay.length > 0 && <View style={styles.group}><AppText variant="labelMedium" color="onSecondaryContainer" style={styles.allDayLabel}>SEPANJANG HARI</AppText>
              {allDay.map(event => <TimelineEventCard key={event.id} event={event}
                onToggleComplete={() => toggleEvent(event.id, event.isCompleted)}
                onDelete={() => handleDelete(event.id, event.title)} />)}
            </View>}
            {timed.length > 0 && <View style={styles.group}><AppText variant="headlineSmall" accessibilityRole="header" style={styles.sectionTitle}>Waktu yang sudah dijaga</AppText>
              {timed.map(event => <TimelineEventCard key={event.id} event={event} selectedDate={selectedDate} hasConflict={conflicts.has(event.id)}
                onToggleComplete={() => toggleEvent(event.id, event.isCompleted)}
                onDelete={() => handleDelete(event.id, event.title)} />)}
            </View>}
            <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.note}>{events.filter(event => event.isCompleted).length}/{events.length} kegiatan selesai · Sisakan ruang untuk istirahat.</AppText>
          </>
      )}
      {isModalVisible && <AddEventModal visible onClose={() => setIsModalVisible(false)} onSubmit={addEvent} selectedDate={selectedDate} />}
    </Screen>
  );
};
const styles = StyleSheet.create({
  group: { marginTop: space[5] },
  sectionTitle: { marginBottom: space[4] },
  allDayLabel: { alignSelf: 'flex-start', backgroundColor: colors.secondaryContainer, padding: space[2], marginBottom: space[3], borderRadius: 8 },
  notice: { marginVertical: space[4] },
  note: { paddingVertical: space[5] },
  loading: { alignItems: 'center', gap: space[3], paddingVertical: space[10] },
});
