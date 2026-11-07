import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import {
  CalendarDays,
  Repeat,
  Plus,
  Sparkles,
  School,
  Flame,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
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
import { isDateOnly } from '@/shared/utils/local-date';

export const AgendaScreen: React.FC = () => {
  const { date: routeDate } = useLocalSearchParams<{ date?: string }>();
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY_MASTER'>('DAILY');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'COMMITMENT' | 'ROUTINE'>('ALL');

  // Daily Agenda State
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

  const currentTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenBg}>
      <View style={styles.header}>
        <View style={styles.titleColumn}>
          <AppText variant="headlineMedium" style={styles.headerTitle}>Agenda</AppText>
        </View>

        {viewMode === 'DAILY' ? (
          <Pressable
            onPress={() => setIsAddEventModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Tambah Agenda Baru"
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
          >
            <Plus size={15} color="#FAF5EB" strokeWidth={3} />
            <AppText variant="labelMedium" style={styles.actionBtnText}>
              Agenda
            </AppText>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => handleOpenAddWeekly(selectedDay)}
            accessibilityRole="button"
            accessibilityLabel="Tambah Jadwal Tetap Baru"
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
          >
            <Plus size={15} color="#FAF5EB" strokeWidth={3} />
            <AppText variant="labelMedium" style={styles.actionBtnText}>
              Jadwal
            </AppText>
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SEGMENT MODE SWITCHER (Daily vs Weekly Master KRS) */}
        <View style={styles.segmentContainer}>
          <Pressable
            onPress={() => setViewMode('DAILY')}
            accessibilityRole="tab"
            accessibilityState={{ selected: viewMode === 'DAILY' }}
            style={[styles.segmentTab, viewMode === 'DAILY' && styles.segmentTabActive]}
          >
            <CalendarDays
              size={15}
              color={viewMode === 'DAILY' ? '#1E1E2E' : '#504535'}
              strokeWidth={2.4}
            />
            <AppText
              variant="labelMedium"
              style={[
                styles.segmentText,
                viewMode === 'DAILY' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              Hari Ini & Tanggal
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('WEEKLY_MASTER')}
            accessibilityRole="tab"
            accessibilityState={{ selected: viewMode === 'WEEKLY_MASTER' }}
            style={[styles.segmentTab, viewMode === 'WEEKLY_MASTER' && styles.segmentTabActive]}
          >
            <Repeat
              size={15}
              color={viewMode === 'WEEKLY_MASTER' ? '#1E1E2E' : '#504535'}
              strokeWidth={2.4}
            />
            <AppText
              variant="labelMedium"
              style={[
                styles.segmentText,
                viewMode === 'WEEKLY_MASTER' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              Master Mingguan (KRS)
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
                <ActivityIndicator color={colors.primary} size="large" />
                <AppText color="onSurfaceVariant">Memuat agenda…</AppText>
              </View>
            ) : (
              !agendaError && (
                <>
                  {/* FAST FILTER CHIPS (Semua / Komitmen / Ritme) */}
                  {weeklyOccurrences.length > 0 && (
                    <View style={styles.filterStrip}>
                      <Pressable
                        onPress={() => setTimelineFilter('ALL')}
                        accessibilityRole="button"
                        style={[
                          styles.filterChip,
                          timelineFilter === 'ALL' && styles.filterChipActive,
                        ]}
                      >
                        <Sparkles
                          size={12}
                          color={timelineFilter === 'ALL' ? colors.onPrimary : colors.onSurfaceVariant}
                          strokeWidth={2.2}
                        />
                        <AppText
                          variant="labelSmall"
                          style={[
                            styles.filterChipText,
                            timelineFilter === 'ALL' && styles.filterChipTextActive,
                          ]}
                        >
                          Semua ({weeklyOccurrences.length + events.length})
                        </AppText>
                      </Pressable>

                      <Pressable
                        onPress={() => setTimelineFilter('COMMITMENT')}
                        accessibilityRole="button"
                        style={[
                          styles.filterChip,
                          timelineFilter === 'COMMITMENT' && styles.filterChipActive,
                        ]}
                      >
                        <School
                          size={12}
                          color={timelineFilter === 'COMMITMENT' ? colors.onPrimary : colors.onSurfaceVariant}
                          strokeWidth={2.2}
                        />
                        <AppText
                          variant="labelSmall"
                          style={[
                            styles.filterChipText,
                            timelineFilter === 'COMMITMENT' && styles.filterChipTextActive,
                          ]}
                        >
                          Komitmen ({commitmentOccurrences.length + events.length})
                        </AppText>
                      </Pressable>

                      {routineOccurrences.length > 0 && (
                        <Pressable
                          onPress={() => setTimelineFilter('ROUTINE')}
                          accessibilityRole="button"
                          style={[
                            styles.filterChip,
                            timelineFilter === 'ROUTINE' && styles.filterChipActive,
                          ]}
                        >
                          <Flame
                            size={12}
                            color={timelineFilter === 'ROUTINE' ? colors.onPrimary : colors.onSurfaceVariant}
                            strokeWidth={2.2}
                          />
                          <AppText
                            variant="labelSmall"
                            style={[
                              styles.filterChipText,
                              timelineFilter === 'ROUTINE' && styles.filterChipTextActive,
                            ]}
                          >
                            Ritme ({routineOccurrences.length})
                          </AppText>
                        </Pressable>
                      )}
                    </View>
                  )}

                  {/* 1. RITME KESEHARIAN (Routine Checklist) */}
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

                  {/* LIVE CURRENT TIME INDICATOR */}
                  {selectedDate === todayDate && (
                    <View style={styles.liveTimeRow}>
                      <AppText variant="labelSmall" tabularNums style={styles.liveTimeDigits}>
                        {currentTimeStr}
                      </AppText>
                      <View style={styles.liveTimeDot} />
                      <View style={styles.liveTimeTrack} />
                      <View style={styles.liveTimeBadge}>
                        <AppText variant="labelSmall" style={styles.liveTimeBadgeText}>
                          Sekarang
                        </AppText>
                      </View>
                    </View>
                  )}

                  {/* 2. KOMITMEN UTAMA (KRS & KERJA) */}
                  {timelineFilter !== 'ROUTINE' && commitmentOccurrences.length > 0 && (
                    <View style={styles.groupSection}>
                      <View style={styles.groupHeaderRow}>
                        <View style={styles.groupHeaderTag}>
                          <Repeat size={13} color={colors.primary} strokeWidth={2.4} />
                          <AppText variant="labelSmall" style={styles.groupHeaderLabel}>
                            KOMITMEN UTAMA (KRS & KERJA)
                          </AppText>
                        </View>
                        <AppText variant="bodySmall" style={styles.groupCountSubtext}>
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

                  {/* 3. SEPANJANG HARI (All-day Events) */}
                  {timelineFilter !== 'ROUTINE' && allDay.length > 0 && (
                    <View style={styles.groupSection}>
                      <View style={styles.allDayBadge}>
                        <AppText variant="labelSmall" style={styles.allDayBadgeText}>
                          SEPANJANG HARI
                        </AppText>
                      </View>
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

                  {/* 4. AGENDA WAKTU KHUSUS (Timed Events) */}
                  {timelineFilter !== 'ROUTINE' && timed.length > 0 && (
                    <View style={styles.groupSection}>
                      <AppText variant="titleMedium" style={styles.sectionHeading}>
                        Jadwal & Komitmen
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

                  {/* EMPTY STATE */}
                  {weeklyOccurrences.length === 0 && events.length === 0 ? (
                    <EmptyState
                      title="Masih ada ruang di harimu"
                      description="Belum ada jadwal tetap atau agenda khusus untuk tanggal ini. Jadwalkan waktu kuliah, kerja, atau istirahat."
                      customIcon={
                        <CalendarDays size={30} color={colors.primary} strokeWidth={2.2} />
                      }
                      actionTitle="Jadwalkan kegiatan"
                      onActionPress={() => setIsAddEventModalVisible(true)}
                    />
                  ) : (
                    <AppText variant="bodySmall" style={styles.summaryNote}>
                      {completedEvents + completedOccurrences}/
                      {events.length + activeOccurrences.length} kegiatan selesai hari ini.
                      Sisakan ruang untuk istirahat.
                    </AppText>
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
                <ActivityIndicator color={colors.primary} size="large" />
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
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: { backgroundColor: '#FCF8FF' },
  header: {
    paddingTop: space[2],
    paddingBottom: space[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleColumn: {
    gap: 4,
  },
  badgeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFEBD9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  badgeText: { fontSize: 11, fontFamily: fontFamily.bold, color: '#A23D28', letterSpacing: 0.6 },
  headerTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: '#1E1E2E',
    lineHeight: 28,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    backgroundColor: '#E06B52',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  actionBtnPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
  actionBtnText: {
    color: '#FAF5EB',
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 90,
    gap: space[3],
  },

  /* SEGMENT MODE SWITCHER */
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EB',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
    marginTop: space[2],
    marginBottom: space[3],
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 999,
    gap: 6,
  },
  segmentTabActive: {
    backgroundColor: '#E8A838', // Custard Gold
    boxShadow: '1.5px 1.5px 0px #1E1E2E',
  },
  segmentText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  segmentTextActive: {
    color: '#1E1E2E',
  },
  segmentTextInactive: {
    color: '#504535',
  },

  timezoneText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#504535',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  notice: {
    marginVertical: space[2],
  },
  loading: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[10],
  },

  /* FILTER STRIP */
  filterStrip: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
  },
  filterChipActive: {
    backgroundColor: '#E8A838',
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#504535',
  },
  filterChipTextActive: {
    color: '#1E1E2E',
  },

  /* LIVE TIME MARKER */
  liveTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
    paddingHorizontal: 2,
  },
  liveTimeDigits: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
  liveTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveTimeTrack: {
    flex: 1,
    height: 2,
    backgroundColor: colors.primaryContainer,
    borderRadius: 1,
  },
  liveTimeBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  liveTimeBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.onPrimaryContainer,
  },

  /* GROUPS */
  groupSection: {
    marginTop: 10,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupHeaderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.6,
  },
  groupCountSubtext: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.onSurfaceVariant,
  },
  allDayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  allDayBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.onWarningContainer,
    letterSpacing: 0.6,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.onSurface,
    marginBottom: 8,
  },
  summaryNote: {
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.onSurfaceVariant,
  },
});
