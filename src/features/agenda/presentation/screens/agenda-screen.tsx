import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  CalendarDays,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Banner,
  EmptyState,
  WaveBackdrop,
  PillTabs,
  SproutPlant,
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
import type {
  WeeklyScheduleEntity,
  WeeklyScheduleType,
} from '../../domain/entities/weekly-schedule.entity';
import { getDayOfWeekFromDate } from '../../domain/entities/weekly-schedule.entity';
import { isDateOnly } from '@/shared/utils/local-date';

const s = colors.sprout;

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
    >
      <WaveBackdrop variant="home" height={285} withBottomHills />

      {/* Top Header matching Sprout Home Wave (Non-sticky) */}
      <View style={styles.header}>
        <AppText variant="headlineMedium" style={styles.headerTitle}>
          Kalender
        </AppText>

        <Pressable
          onPress={() => {
            if (viewMode === 'DAILY') {
              router.push({ pathname: '/agenda/new', params: { date: selectedDate } });
            } else {
              handleOpenAddWeekly(selectedDay);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={
            viewMode === 'DAILY' ? 'Tambah Agenda Baru' : 'Tambah Jadwal Tetap Baru'
          }
          style={({ pressed }) => [styles.calendarIconBtn, pressed && { opacity: 0.8 }]}
        >
          <CalendarDays size={22} color={s.ink} strokeWidth={2.3} />
        </Pressable>
      </View>

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

            {/* Sprout Summary Pill Card matching bottom of Kalender Reference UI */}
            <Pressable
              onPress={() => router.push({ pathname: '/agenda/new', params: { date: selectedDate } })}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.sproutSummaryBanner,
                pressed && { transform: [{ scale: 0.99 }] },
              ]}
            >
              <View style={styles.sproutBannerLeft}>
                <SproutPlant size={38} />
                <View style={styles.sproutBannerTexts}>
                  <AppText style={styles.sproutBannerTitle}>
                    {selectedDate === todayDate ? 'Hari Ini' : 'Tanggal'} · {shortDateLabel}
                  </AppText>
                  <AppText style={styles.sproutBannerSub}>
                    {totalDayTasks} Tugas
                  </AppText>
                </View>
              </View>
              <ChevronRight size={20} color={s.ink} strokeWidth={2.4} />
            </Pressable>

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
                <ActivityIndicator color={s.forest} size="large" />
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
                      title="Masih ada ruang di harimu"
                      description="Belum ada jadwal tetap atau agenda khusus untuk tanggal ini."
                      customIcon={<CalendarDays size={30} color={s.forest} strokeWidth={2.2} />}
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
                <ActivityIndicator color={s.forest} size="large" />
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
  screenBg: {
    backgroundColor: s.cream,
  },
  header: {
    paddingTop: space[3],
    paddingBottom: space[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.bold,
    color: s.ink,
  },
  calendarIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: s.card,
    borderWidth: 1,
    borderColor: '#EDE4D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
    gap: space[4],
  },
  sproutSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1EBDC',
    borderRadius: 26,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  sproutBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  sproutBannerTexts: {
    gap: 2,
  },
  sproutBannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  sproutBannerSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  notice: {
    marginVertical: space[1],
  },
  loading: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[10],
  },
  groupSection: {
    marginTop: 4,
  },
});
