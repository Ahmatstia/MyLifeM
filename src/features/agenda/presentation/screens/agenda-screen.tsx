import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CalendarHeart, Repeat } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { Screen, ScreenHeader, AppText, Button, Banner, EmptyState } from '@/shared/ui';
import { useAgenda } from '../hooks/use-agenda';
import { useWeeklySchedules } from '../hooks/use-weekly-schedules';
import { DateStripHeader } from '../components/date-strip-header';
import { TimelineEventCard } from '../components/timeline-event-card';
import { AddEventModal } from '../components/add-event-modal';
import { WeeklyOccurrenceCard } from '../components/weekly-occurrence-card';
import { DailyRoutineChecklist } from '../components/daily-routine-checklist';
import { WeeklyScheduleManager } from '../components/weekly-schedule-manager';
import { AddEditWeeklyScheduleModal } from '../components/add-edit-weekly-schedule-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { conflictingEventIds } from '../../domain/agenda-time';
import type { WeeklyScheduleEntity, WeeklyScheduleType } from '../../domain/entities/weekly-schedule.entity';
import { getDayOfWeekFromDate } from '../../domain/entities/weekly-schedule.entity';

export const AgendaScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY_MASTER'>('DAILY');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'COMMITMENT' | 'ROUTINE'>('ALL');

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
    addSchedulesForDays,
    editSchedule,
    removeSchedule,
  } = useWeeklySchedules();

  // Modals state
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const [isWeeklyModalVisible, setIsWeeklyModalVisible] = useState(false);
  const [editingWeeklySchedule, setEditingWeeklySchedule] = useState<WeeklyScheduleEntity | undefined>(undefined);
  const [weeklyModalDefaultDay, setWeeklyModalDefaultDay] = useState(1);
  const [weeklyModalInitialType, setWeeklyModalInitialType] = useState<WeeklyScheduleType | undefined>(undefined);

  useOpenAddFromParam(() => {
    if (viewMode === 'DAILY') {
      setIsAddEventModalVisible(true);
    } else {
      setEditingWeeklySchedule(undefined);
      setWeeklyModalDefaultDay(selectedDay);
      setWeeklyModalInitialType(undefined);
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

  const handleOpenAddWeekly = (day: number, type?: WeeklyScheduleType) => {
    setEditingWeeklySchedule(undefined);
    setWeeklyModalDefaultDay(day);
    setWeeklyModalInitialType(type);
    setIsWeeklyModalVisible(true);
  };

  const handleOpenEditWeekly = (schedule: WeeklyScheduleEntity) => {
    setEditingWeeklySchedule(schedule);
    setWeeklyModalDefaultDay(schedule.dayOfWeek);
    setWeeklyModalInitialType(schedule.scheduleType);
    setIsWeeklyModalVisible(true);
  };

  const activeOccurrences = weeklyOccurrences.filter((occ) => !occ.isCancelled);
  const completedOccurrences = activeOccurrences.filter((occ) => occ.isCompleted).length;
  const completedEvents = events.filter((event) => event.isCompleted).length;

  const routineOccurrences = weeklyOccurrences.filter((occ) => occ.schedule.scheduleType === 'ROUTINE');
  const commitmentOccurrences = weeklyOccurrences.filter((occ) => occ.schedule.scheduleType !== 'ROUTINE');
  const activeCommitments = commitmentOccurrences.filter((occ) => !occ.isCancelled);
  const completedCommitments = activeCommitments.filter((occ) => occ.isCompleted).length;

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
          <CalendarHeart size={16} color={viewMode === 'DAILY' ? colors.onPrimary : colors.onSurface} strokeWidth={2.4} />
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
          <Repeat size={16} color={viewMode === 'WEEKLY_MASTER' ? colors.onPrimary : colors.onSurface} strokeWidth={2.4} />
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
              {/* Filter Chips: Semua / Komitmen / Ritme */}
              {weeklyOccurrences.length > 0 && (
                <View style={styles.filterRow}>
                  <Pressable
                    onPress={() => setTimelineFilter('ALL')}
                    accessibilityRole="button"
                    style={[styles.filterChip, timelineFilter === 'ALL' && styles.filterChipActive]}
                  >
                    <AppText
                      variant="labelSmall"
                      color={timelineFilter === 'ALL' ? 'onPrimary' : 'onSurfaceVariant'}
                    >
                      Semua ({weeklyOccurrences.length + events.length})
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => setTimelineFilter('COMMITMENT')}
                    accessibilityRole="button"
                    style={[styles.filterChip, timelineFilter === 'COMMITMENT' && styles.filterChipActive]}
                  >
                    <AppText
                      variant="labelSmall"
                      color={timelineFilter === 'COMMITMENT' ? 'onPrimary' : 'onSurfaceVariant'}
                    >
                      Komitmen ({commitmentOccurrences.length + events.length})
                    </AppText>
                  </Pressable>

                  {routineOccurrences.length > 0 && (
                    <Pressable
                      onPress={() => setTimelineFilter('ROUTINE')}
                      accessibilityRole="button"
                      style={[styles.filterChip, timelineFilter === 'ROUTINE' && styles.filterChipActive]}
                    >
                      <AppText
                        variant="labelSmall"
                        color={timelineFilter === 'ROUTINE' ? 'onPrimary' : 'onSurfaceVariant'}
                      >
                        Ritme ({routineOccurrences.length})
                      </AppText>
                    </Pressable>
                  )}
                </View>
              )}

              {/* 1. Ritme Keseharian (Layered Routine Checklist) */}
              {timelineFilter !== 'COMMITMENT' && routineOccurrences.length > 0 && (
                <DailyRoutineChecklist
                  routines={routineOccurrences}
                  onToggleComplete={(id, currentCompleted) =>
                    toggleWeeklyOccurrence(id, currentCompleted)
                  }
                  onToggleCancelled={(id, currentCancelled) =>
                    toggleWeeklyOccurrenceCancellation(id, currentCancelled)
                  }
                  onAddRoutine={() =>
                    handleOpenAddWeekly(getDayOfWeekFromDate(selectedDate), 'ROUTINE')
                  }
                />
              )}

              {/* 2. Komitmen Utama (KRS & Kerja) */}
              {timelineFilter !== 'ROUTINE' && commitmentOccurrences.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeaderRow}>
                    <View style={styles.groupHeaderTag}>
                      <Repeat size={14} color={colors.primary} />
                      <AppText variant="labelMedium" color="primary" style={styles.groupHeaderLabel}>
                        KOMITMEN UTAMA (KRS & KERJA)
                      </AppText>
                    </View>
                    <AppText variant="bodySmall" color="onSurfaceVariant">
                      {completedCommitments}/{activeCommitments.length} selesai
                    </AppText>
                  </View>

                  {commitmentOccurrences.map((occ) => (
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

              {/* 3. All-day Events */}
              {timelineFilter !== 'ROUTINE' && allDay.length > 0 && (
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

              {/* 4. Timed One-Off Events */}
              {timelineFilter !== 'ROUTINE' && timed.length > 0 && (
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
                  customIcon={<CalendarHeart size={36} color={colors.onPrimaryContainer} strokeWidth={2.4} />}
                  actionTitle="Jadwalkan kegiatan"
                  onActionPress={() => setIsAddEventModalVisible(true)}
                />
              ) : (
                <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.summaryNote}>
                  {completedEvents + completedOccurrences}/{events.length + activeOccurrences.length} kegiatan selesai hari ini. Sisakan ruang untuk istirahat.
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
            initialScheduleType={weeklyModalInitialType}
            onClose={() => {
              setIsWeeklyModalVisible(false);
              setEditingWeeklySchedule(undefined);
              setWeeklyModalInitialType(undefined);
            }}
            onSubmit={async (input, days) => {
              if (editingWeeklySchedule) {
                return editSchedule(editingWeeklySchedule.id, input);
              } else if (days && days.length > 1 && addSchedulesForDays) {
                return addSchedulesForDays(days, input);
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
  filterRow: {
    flexDirection: 'row',
    gap: space[2],
    marginVertical: space[2],
  },
  filterChip: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
