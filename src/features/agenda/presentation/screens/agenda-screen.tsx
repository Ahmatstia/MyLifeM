import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Calendar, Repeat } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { Screen, ScreenHeader, AppText, Button, Banner, EmptyState } from '@/shared/ui';
import { useAgenda } from '../hooks/use-agenda';
import { useWeeklySchedules } from '../hooks/use-weekly-schedules';
import { DateStripHeader } from '../components/date-strip-header';
import { TimelineEventCard } from '../components/timeline-event-card';
import { AddEventModal } from '../components/add-event-modal';
import { WeeklyOccurrenceCard } from '../components/weekly-occurrence-card';
import { WeeklyScheduleManager } from '../components/weekly-schedule-manager';
import { AddEditWeeklyScheduleModal } from '../components/add-edit-weekly-schedule-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { conflictingEventIds } from '../../domain/agenda-time';
import type { WeeklyScheduleEntity } from '../../domain/entities/weekly-schedule.entity';

export const AgendaScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY_MASTER'>('DAILY');

  // Daily Agenda State
  const {
    selectedDate,
    setSelectedDate,
    todayDate,
    timeZone,
    events = [],
    weeklyOccurrences = [],
    isLoading: isAgendaLoading,
    error: agendaError,
    reminderWarning,
    retryReminders,
    refresh: refreshAgenda,
    addEvent,
    toggleEvent,
    removeEvent,
    toggleWeeklyOccurrence,
    toggleWeeklyOccurrenceCancellation,
  } = useAgenda();

  // Weekly Master Schedule State
  const {
    schedulesByDay = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
    selectedDay = 1,
    setSelectedDay = () => {},
    isLoading: isWeeklyLoading,
    error: weeklyError,
    refresh: refreshWeekly,
    addSchedule,
    editSchedule,
    removeSchedule,
  } = useWeeklySchedules();

  // Modals state
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const [isWeeklyModalVisible, setIsWeeklyModalVisible] = useState(false);
  const [editingWeeklySchedule, setEditingWeeklySchedule] = useState<WeeklyScheduleEntity | undefined>(undefined);
  const [weeklyModalDefaultDay, setWeeklyModalDefaultDay] = useState(1);

  useOpenAddFromParam(() => {
    if (viewMode === 'DAILY') {
      setIsAddEventModalVisible(true);
    } else {
      setEditingWeeklySchedule(undefined);
      setWeeklyModalDefaultDay(selectedDay);
      setIsWeeklyModalVisible(true);
    }
  });

  const allDay = events.filter((event) => event.isAllDay);
  const timed = events.filter((event) => !event.isAllDay);
  const conflicts = conflictingEventIds(events);

  const handleDeleteAgenda = (id: string, title: string) => {
    Alert.alert('Hapus agenda?', title, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus agenda', style: 'destructive', onPress: () => removeEvent(id) },
    ]);
  };

  const handleOpenAddWeekly = (day: number) => {
    setEditingWeeklySchedule(undefined);
    setWeeklyModalDefaultDay(day);
    setIsWeeklyModalVisible(true);
  };

  const handleOpenEditWeekly = (schedule: WeeklyScheduleEntity) => {
    setEditingWeeklySchedule(schedule);
    setWeeklyModalDefaultDay(schedule.dayOfWeek);
    setIsWeeklyModalVisible(true);
  };

  const activeOccurrences = weeklyOccurrences.filter((occ) => !occ.isCancelled);
  const completedOccurrences = activeOccurrences.filter((occ) => occ.isCompleted).length;
  const completedEvents = events.filter((event) => event.isCompleted).length;

  return (
    <Screen>
      <ScreenHeader
        title="Ritme harimu."
        subtitle={viewMode === 'DAILY' ? 'Agenda & jadwal harian' : 'Master jadwal KRS & kerja mingguan'}
        action={
          viewMode === 'DAILY' ? (
            <Button
              title="+ Agenda"
              size="compact"
              onPress={() => setIsAddEventModalVisible(true)}
            />
          ) : (
            <Button
              title="+ Jadwal Tetap"
              size="compact"
              onPress={() => handleOpenAddWeekly(selectedDay)}
            />
          )
        }
      />

      {/* Mode Selector Segment (Harian vs Jadwal Tetap KRS) */}
      <View style={styles.segmentContainer}>
        <Pressable
          onPress={() => setViewMode('DAILY')}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'DAILY' }}
          style={[styles.segmentTab, viewMode === 'DAILY' && styles.segmentTabActive]}
        >
          <Calendar size={16} color={viewMode === 'DAILY' ? colors.onPrimary : colors.onSurface} />
          <AppText
            variant="labelMedium"
            color={viewMode === 'DAILY' ? 'onPrimary' : 'onSurface'}
            style={viewMode === 'DAILY' ? styles.segmentTextActive : undefined}
          >
            Agenda Harian
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('WEEKLY_MASTER')}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'WEEKLY_MASTER' }}
          style={[styles.segmentTab, viewMode === 'WEEKLY_MASTER' && styles.segmentTabActive]}
        >
          <Repeat size={16} color={viewMode === 'WEEKLY_MASTER' ? colors.onPrimary : colors.onSurface} />
          <AppText
            variant="labelMedium"
            color={viewMode === 'WEEKLY_MASTER' ? 'onPrimary' : 'onSurface'}
            style={viewMode === 'WEEKLY_MASTER' ? styles.segmentTextActive : undefined}
          >
            Jadwal Tetap (KRS)
          </AppText>
        </Pressable>
      </View>

      {/* VIEW 1: DAILY TIMELINE */}
      {viewMode === 'DAILY' && (
        <>
          <DateStripHeader
            selectedDate={selectedDate}
            todayDate={todayDate}
            onSelectDate={setSelectedDate}
          />
          <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.note}>
            Zona waktu perangkat: {timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}
          </AppText>

          {reminderWarning && (
            <Banner
              variant="warning"
              message={reminderWarning}
              actionText="Periksa izin pengingat"
              onActionPress={retryReminders}
              style={styles.notice}
            />
          )}

          {!isAgendaLoading && !agendaError && conflicts.size > 0 && (
            <Banner
              variant="info"
              message="Ada agenda dengan waktu bertumpuk. Jadwal tetap disimpan; sesuaikan jika diperlukan."
              style={styles.notice}
            />
          )}

          {agendaError && (
            <Banner
              variant="error"
              message={agendaError}
              actionText="Coba lagi"
              onActionPress={refreshAgenda}
              style={styles.notice}
            />
          )}

          {isAgendaLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <AppText color="onSurfaceVariant">Memuat agenda…</AppText>
            </View>
          ) : !agendaError && (
            <>
              {/* A. Section Jadwal Tetap Hari Ini (Projected from Master KRS) */}
              {weeklyOccurrences.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeaderRow}>
                    <View style={styles.groupHeaderTag}>
                      <Repeat size={14} color={colors.primary} />
                      <AppText variant="labelMedium" color="primary" style={styles.groupHeaderLabel}>
                        JADWAL TETAP PEKANAN (KRS & KERJA)
                      </AppText>
                    </View>
                    <AppText variant="bodySmall" color="onSurfaceVariant">
                      {completedOccurrences}/{activeOccurrences.length} selesai
                    </AppText>
                  </View>

                  {weeklyOccurrences.map((occ) => (
                    <WeeklyOccurrenceCard
                      key={occ.schedule.id}
                      occurrence={occ}
                      onToggleComplete={() =>
                        toggleWeeklyOccurrence(occ.schedule.id, occ.isCompleted)
                      }
                      onToggleCancelled={() =>
                        toggleWeeklyOccurrenceCancellation(occ.schedule.id, occ.isCancelled)
                      }
                    />
                  ))}
                </View>
              )}

              {/* B. All-day Events */}
              {allDay.length > 0 && (
                <View style={styles.group}>
                  <AppText variant="labelMedium" color="onSecondaryContainer" style={styles.allDayLabel}>
                    SEPANJANG HARI
                  </AppText>
                  {allDay.map((event) => (
                    <TimelineEventCard
                      key={event.id}
                      event={event}
                      onToggleComplete={() => toggleEvent(event.id, event.isCompleted)}
                      onDelete={() => handleDeleteAgenda(event.id, event.title)}
                    />
                  ))}
                </View>
              )}

              {/* C. Timed One-Off Events */}
              {timed.length > 0 && (
                <View style={styles.group}>
                  <AppText variant="headlineSmall" accessibilityRole="header" style={styles.sectionTitle}>
                    Agenda Waktu Khusus
                  </AppText>
                  {timed.map((event) => (
                    <TimelineEventCard
                      key={event.id}
                      event={event}
                      selectedDate={selectedDate}
                      hasConflict={conflicts.has(event.id)}
                      onToggleComplete={() => toggleEvent(event.id, event.isCompleted)}
                      onDelete={() => handleDeleteAgenda(event.id, event.title)}
                    />
                  ))}
                </View>
              )}

              {/* Empty state if both are empty */}
              {weeklyOccurrences.length === 0 && events.length === 0 ? (
                <EmptyState
                  title="Masih ada ruang di harimu"
                  description="Belum ada jadwal tetap atau agenda khusus untuk tanggal ini. Jadwalkan waktu kuliah, kerja, atau istirahat."
                  customIcon={<Calendar size={32} color={colors.onPrimaryContainer} />}
                  actionTitle="Jadwalkan kegiatan"
                  onActionPress={() => setIsAddEventModalVisible(true)}
                />
              ) : (
                <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.summaryNote}>
                  {completedEvents + completedOccurrences}/{events.length + activeOccurrences.length} komitmen selesai hari ini. Sisakan ruang untuk istirahat.
                </AppText>
              )}
            </>
          )}

          {isAddEventModalVisible && (
            <AddEventModal
              visible
              onClose={() => setIsAddEventModalVisible(false)}
              onSubmit={addEvent}
              selectedDate={selectedDate}
            />
          )}
        </>
      )}

      {/* VIEW 2: WEEKLY MASTER SCHEDULE (KRS MANAGER) */}
      {viewMode === 'WEEKLY_MASTER' && (
        <>
          {weeklyError && (
            <Banner
              variant="error"
              message={weeklyError}
              actionText="Coba lagi"
              onActionPress={refreshWeekly}
              style={styles.notice}
            />
          )}

          {isWeeklyLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <AppText color="onSurfaceVariant">Memuat master jadwal mingguan…</AppText>
            </View>
          ) : (
            <WeeklyScheduleManager
              schedulesByDay={schedulesByDay}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onAddSchedule={handleOpenAddWeekly}
              onEditSchedule={handleOpenEditWeekly}
              onDeleteSchedule={removeSchedule}
            />
          )}

          <AddEditWeeklyScheduleModal
            visible={isWeeklyModalVisible}
            initialData={editingWeeklySchedule}
            defaultDayOfWeek={weeklyModalDefaultDay}
            onClose={() => {
              setIsWeeklyModalVisible(false);
              setEditingWeeklySchedule(undefined);
            }}
            onSubmit={async (input) => {
              if (editingWeeklySchedule) {
                return editSchedule(editingWeeklySchedule.id, input);
              } else {
                return addSchedule(input);
              }
            }}
          />
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: space[3],
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[2],
    borderRadius: radius.md,
    gap: space[2],
  },
  segmentTabActive: {
    backgroundColor: colors.primary,
  },
  segmentTextActive: {
    fontFamily: fontFamily.semibold,
  },
  group: {
    marginTop: space[4],
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  groupHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  groupHeaderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: space[4],
  },
  allDayLabel: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    padding: space[2],
    marginBottom: space[3],
    borderRadius: 8,
  },
  notice: {
    marginVertical: space[3],
  },
  note: {
    paddingVertical: space[2],
  },
  summaryNote: {
    paddingVertical: space[4],
  },
  loading: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[10],
  },
});
