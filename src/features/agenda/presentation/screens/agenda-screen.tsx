import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import {
  CalendarDays,
  Plus,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, touchTarget } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Banner,
  EmptyState,
  PillTabs,
} from '@/shared/ui';
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
import { WEEKLY_REMINDER_DAYS } from '../../domain/weekly-reminders';
import type {
  WeeklyScheduleEntity,
  WeeklyScheduleType,
} from '../../domain/entities/weekly-schedule.entity';
import { getDayOfWeekFromDate } from '../../domain/entities/weekly-schedule.entity';
import { isDateOnly } from '@/shared/utils/local-date';

export const AgendaScreen: React.FC = () => {
  const { date: routeDate } = useLocalSearchParams<{ date?: string }>();
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY_MASTER'>('DAILY');
  const [timelineFilter] = useState<'ALL' | 'COMMITMENT' | 'ROUTINE'>('ALL');

  const {
    selectedDate,
    setSelectedDate,
    todayDate,
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

  useEffect(() => {
    if (typeof routeDate === 'string' && isDateOnly(routeDate)) setSelectedDate(routeDate);
  }, [routeDate, setSelectedDate]);

  const {
    schedulesByDay = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
    selectedDay = 1,
    setSelectedDay = () => {},
    isLoading: isWeeklyLoading,
    error: weeklyError,
    reminderWarning: weeklyReminderWarning,
    retryReminders: retryWeeklyReminders,
    refresh: refreshWeekly,
    addSchedule,
    addSchedulesForDays,
    editSchedule,
    removeSchedule,
  } = useWeeklySchedules();

  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const [isWeeklyModalVisible, setIsWeeklyModalVisible] = useState(false);
  const [editingWeeklySchedule, setEditingWeeklySchedule] = useState<
    WeeklyScheduleEntity | undefined
  >(undefined);
  const [weeklyModalDefaultDay, setWeeklyModalDefaultDay] = useState(1);
  const [weeklyModalInitialType, setWeeklyModalInitialType] = useState<
    WeeklyScheduleType | undefined
  >(undefined);

  useOpenAddFromParam(() => {
    if (viewMode === 'DAILY') {
      router.push({ pathname: '/agenda/new', params: { date: selectedDate } });
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
  const routineOccurrences = weeklyOccurrences.filter(
    (occ) => occ.schedule.scheduleType === 'ROUTINE'
  );
  const commitmentOccurrences = weeklyOccurrences.filter(
    (occ) => occ.schedule.scheduleType !== 'ROUTINE'
  );

  const [selY, selM, selD] = selectedDate.split('-').map(Number);
  const shortDateLabel = new Date(selY, selM - 1, selD).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
  const totalDayTasks = events.length + activeOccurrences.length;

  return (
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={styles.scrollContent}
      overlay={viewMode === 'WEEKLY_MASTER' && (
        <View style={styles.floatingFabContainer} pointerEvents="box-none">
          <Pressable
            onPress={() => handleOpenAddWeekly(selectedDay)}
            accessibilityRole="button"
            accessibilityLabel="Tambah Jadwal Tetap Baru"
            style={({ pressed }) => [styles.fabSquare, pressed && styles.fabSquarePressed]}
          >
            <Plus size={space[6]} color={colors.onHighlight} />
          </Pressable>
        </View>
      )}
    >
      <AppText variant="displayMedium" accessibilityRole="header" style={styles.header}>Kalender</AppText>

      <PillTabs
          options={[
            { value: 'DAILY', label: 'Kalender Harian' },
            { value: 'WEEKLY_MASTER', label: 'Jadwal Rutin' },
          ]}
          value={viewMode}
          onChange={setViewMode}
        />

        {viewMode === 'DAILY' && (
          <>
            <DateStripHeader
              selectedDate={selectedDate}
              todayDate={todayDate}
              onSelectDate={setSelectedDate}
            />

            <View style={styles.agendaHeading}>
              <View style={styles.agendaCopy}>
                <AppText variant="headlineSmall" accessibilityRole="header">
                  {selectedDate === todayDate ? 'Hari ini, ' : 'Agenda '}{shortDateLabel}
                </AppText>
                <AppText variant="labelLarge" color="onSurfaceVariant">{totalDayTasks} kegiatan</AppText>
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/agenda/new', params: { date: selectedDate } })}
                accessibilityRole="button"
                accessibilityLabel="Tambah Agenda Baru"
                accessibilityHint={'Pada ' + shortDateLabel}
                style={({ pressed }) => [styles.addEvent, pressed && styles.pressed]}
              >
                <Plus size={space[4]} color={colors.primary} />
                <AppText variant="labelLarge" color="primary">Kegiatan</AppText>
              </Pressable>
            </View>

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
                message="Ada agenda dengan waktu bertumpuk. Periksa jam mulai dan selesai."
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
                <View style={styles.placeholder} />
                <AppText color="onSurfaceVariant">Memuat agenda…</AppText>
              </View>
            ) : (
              !agendaError && (
                <>
                  {/* 1. RITME KESEHARIAN */}
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

                  {/* 2. JADWAL RUTIN */}
                  {timelineFilter !== 'ROUTINE' && commitmentOccurrences.length > 0 && (
                    <View style={styles.groupSection}>
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

                  {/* 3. SEPANJANG HARI */}
                  {timelineFilter !== 'ROUTINE' && allDay.length > 0 && (
                    <View style={styles.groupSection}>
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

                  {/* 4. AGENDA WAKTU KHUSUS */}
                  {timelineFilter !== 'ROUTINE' && timed.length > 0 && (
                    <View style={styles.groupSection}>
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

                  {weeklyOccurrences.length === 0 && events.length === 0 && (
                    <EmptyState
                      title="Belum ada kegiatan"
                      description="Pilih jam untuk kegiatan pertama pada tanggal ini."
                      customIcon={<CalendarDays size={space[6]} color={colors.primary} />}
                      actionTitle="Jadwalkan kegiatan"
                      onActionPress={() =>
                        router.push({ pathname: '/agenda/new', params: { date: selectedDate } })
                      }
                    />
                  )}
                </>
              )
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

        {viewMode === 'WEEKLY_MASTER' && (
          <>
            <Banner
              variant="info"
              message={`Pengingat disiapkan untuk ${WEEKLY_REMINDER_DAYS} hari ke depan, maksimal 50 pengingat kalender terdekat. Buka aplikasi secara berkala untuk memperbaruinya.`}
              style={styles.notice}
            />
            {weeklyReminderWarning && (
              <Banner
                variant="warning"
                message={weeklyReminderWarning}
                actionText="Periksa izin pengingat"
                onActionPress={retryWeeklyReminders}
                style={styles.notice}
              />
            )}
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
                <View style={styles.placeholder} />
                <AppText color="onSurfaceVariant">Memuat jadwal rutin mingguan…</AppText>
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
  screenBg: { backgroundColor: colors.background },
  header: { marginTop: space[5] },
  scrollContent: { paddingBottom: touchTarget.min + space[10], gap: space[3] },
  agendaHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: space[2],
    paddingTop: space[3],
    borderTopColor: colors.outline,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  agendaCopy: { flexShrink: 1 },
  addEvent: { minHeight: touchTarget.min, flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[2], borderRadius: radius.sm },
  pressed: { backgroundColor: colors.surfaceContainer },
  notice: { marginVertical: space[1] },
  loading: { alignItems: 'flex-start', gap: space[3], paddingVertical: space[4] },
  placeholder: { width: '65%', height: space[3], backgroundColor: colors.surfaceContainer },
  groupSection: { marginTop: space[1] },
  floatingFabContainer: { position: 'absolute', right: space[4], bottom: space[4] },
  fabSquare: { width: touchTarget.min, height: touchTarget.min, borderRadius: radius.md, backgroundColor: colors.highlight, alignItems: 'center', justifyContent: 'center' },
  fabSquarePressed: { backgroundColor: colors.sprout.sunDeep },
});
