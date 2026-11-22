import React, { useState } from 'react';
import {
  useWindowDimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  CalendarDays,
  Pause,
  Play,
  Plus,
  Repeat,
  X,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, radius, space, touchTarget } from '@/theme/tokens';
import {
  AppText,
  Banner,
  Screen,
  SproutCheck,
} from '@/shared/ui';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useAgenda } from '@/features/agenda/presentation/hooks/use-agenda';
import { PrayerTimesWidget } from '@/features/prayer-times/presentation/components/prayer-times-widget';
import { usePrayerTimes } from '@/features/prayer-times/presentation/hooks/use-prayer-times';
import { AddPriorityModal } from '../components/add-priority-modal';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { SessionReflectionModal } from '../components/session-reflection-modal';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { useTodayFocus } from '../hooks/use-today-focus';

const s = colors.sprout;

export const TodayFocusScreen: React.FC = () => {
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.5;
  const {
    focusItems,
    todayDate,
    completedMinutes,
    availableTasks,
    isLoading,
    error,
    refresh,
    toggleTask,
    addQuickTask,
    addTaskToToday,
    removeFromToday,
  } = useTodayFocus();

  const {
    events = [],
    weeklyOccurrences = [],
    toggleEvent,
    toggleWeeklyOccurrence,
  } = useAgenda();

  const prayerSchedule = usePrayerTimes();
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  useOpenAddFromParam(() => router.push('/today/new'));
  const timer = useFocusTimer({ onSessionRecorded: refresh });

  const completedCount = focusItems.filter((item) => item.isCompleted).length;
  const activeItems = focusItems.filter((item) => item.task.status !== 'CANCELLED');
  const nextTask = activeItems.find((item) => !item.isCompleted)?.task;

  const activeOccurrences = weeklyOccurrences.filter((occ) => !occ.isCancelled);
  const totalAgendaCount = events.length + activeOccurrences.length;
  const completedAgendaCount =
    events.filter((e) => e.isCompleted).length +
    activeOccurrences.filter((occ) => occ.isCompleted).length;

  const totalCombinedCount = focusItems.length + totalAgendaCount;
  const completedCombinedCount = completedCount + completedAgendaCount;
  const combinedProgressPercent =
    totalCombinedCount > 0
      ? Math.round((completedCombinedCount / totalCombinedCount) * 100)
      : 0;

  const ribbonTask = timer.activeTask ?? (timer.hasSession ? null : nextTask);
  const emptyTitle = activeItems.length ? 'Semua tugas selesai' : 'Pilih tugas pertama';
  const ribbonTitle = ribbonTask?.title ?? (timer.hasSession ? 'Fokus mandiri' : emptyTitle);
  const estimate = timer.activeTask
    ? focusItems.find(item => item.taskId === timer.activeTask?.id)?.task.estimatedMinutes
    : nextTask?.estimatedMinutes;
  const hasEstimate = estimate !== undefined && Number.isFinite(estimate) && estimate > 0;
  const ribbonState = timer.reflection ? 'Sesi tercatat' : timer.isRunning ? 'Sesi berjalan' : timer.hasSession ? 'Sesi dijeda' : 'Fokus berikutnya';
  const ribbonAction = timer.hasSession ? 'Lihat sesi fokus' : ribbonTask ? 'Buka fokus' : 'Pilih tugas';
  const dateLabel = todayDate ? new Date(`${todayDate}T12:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) : '';

  const handleHeroPress = () => {
    if (!nextTask && !timer.activeTask && !timer.hasSession) {
      router.push('/today/new');
    } else {
      if (!timer.hasSession && !timer.activeTask && nextTask) {
        timer.setActiveTask(nextTask);
      }
      setIsTimerExpanded((prev) => !prev);
    }
  };

  // Build total count to know which row is the very last on the timeline spine
  const totalTimelineNodes =
    focusItems.length + events.length + activeOccurrences.length;

  return (
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <>
          <AddPriorityModal
            visible={isAddModalVisible}
            availableTasks={availableTasks}
            currentCount={focusItems.length}
            onClose={() => setIsAddModalVisible(false)}
            onAddQuickTask={addQuickTask}
            onSelectExistingTask={addTaskToToday}
          />

          {timer.reflection && (
            <SessionReflectionModal
              key={timer.reflection.id}
              visible
              durationMinutes={Math.floor(timer.reflection.elapsedMs / 60_000)}
              taskTitle={timer.reflection.taskTitle ?? undefined}
              onClose={timer.dismissReflection}
              onSubmit={timer.saveReflection}
            />
          )}
        </>
      }
    >
      <View style={styles.header}>
        <AppText variant="displayMedium" accessibilityRole="header" style={styles.greetingTitle}>Hari ini</AppText>
        {dateLabel ? <AppText variant="bodyMedium" style={styles.greetingSubtext}>{dateLabel}</AppText> : null}
      </View>

      {timer.error && (
        <Banner
          variant="error"
          message={timer.error}
          actionText="Coba lagi"
          onActionPress={timer.retry}
          style={styles.notice}
        />
      )}
      {error && (
        <Banner
          variant="error"
          message={error}
          actionText="Coba lagi"
          onActionPress={refresh}
          style={styles.notice}
        />
      )}

      {isLoading ? (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <AppText variant="titleMedium">Memuat tugas hari ini…</AppText>
          <View accessible={false} style={styles.skeletonLong} />
          <View accessible={false} style={styles.skeletonShort} />
        </View>
      ) : (
        !error && (
          <>
            {!isTimerExpanded && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={ribbonAction}
                accessibilityHint={ribbonTitle}
                onPress={handleHeroPress}
                style={({ pressed }) => [styles.ribbon, pressed && styles.ribbonPressed]}
              >
                <View style={styles.ribbonBody}>
                  <AppText variant="labelLarge" style={styles.ribbonState}>{ribbonState}</AppText>
                  <AppText variant="headlineLarge" style={styles.ribbonTitle}>{ribbonTitle}</AppText>
                </View>
                <View style={styles.ribbonSeam} accessible={false} pointerEvents="none">
                  <View style={styles.ribbonNotch} />
                  <View style={styles.ribbonPerforation} />
                  <View style={styles.ribbonNotch} />
                </View>
                <View style={[styles.ribbonStub, largeText && styles.stack]}>
                  <View style={styles.ribbonAction}>
                    {ribbonTask || timer.hasSession
                      ? <Play size={space[4]} color={s.ink} fill={s.ink} />
                      : <Plus size={space[4]} color={s.ink} />}
                    <AppText variant="titleSmall" style={styles.actionText}>{ribbonAction}</AppText>
                  </View>
                  {timer.hasSession || hasEstimate ? (
                    <View style={styles.timeColumn}>
                      <AppText variant="titleLarge" tabularNums style={styles.ribbonTime}>
                        {timer.hasSession ? timer.formattedTime : `${estimate} mnt`}
                      </AppText>
                      <AppText variant="labelSmall" style={styles.timeLabel}>
                        {timer.hasSession ? timer.mode === 'STOPWATCH' ? 'waktu berjalan' : 'waktu tersisa' : 'perkiraan tugas'}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            )}
            {isTimerExpanded && (
              <FocusTimerWidget
                mode={timer.mode}
                formattedTime={timer.formattedTime}
                ready={timer.ready}
                hasSession={timer.hasSession}
                preferences={timer.preferences}
                selectedMinutes={timer.selectedMinutes}
                onFinish={timer.finishTimer}
                isRunning={timer.isRunning}
                activeTask={timer.activeTask}
                progressRatio={timer.progressRatio}
                onChangeMode={timer.changeMode}
                onStart={timer.startTimer}
                onPause={timer.pauseTimer}
                onReset={timer.resetTimer}
                onClearActiveTask={() => timer.setActiveTask(null)}
                onMinimize={() => setIsTimerExpanded(false)}
              />
            )}

            <View style={styles.sectionHeaderBlock}>
              <View style={styles.sectionHeaderTop}>
                <View style={styles.sectionTitleGroup}>
                  <AppText variant="titleLarge" accessibilityRole="header" style={styles.sectionHeading}>Rencana hari ini</AppText>
                  {(totalCombinedCount > 0 || completedMinutes > 0) && (
                    <AppText variant="bodySmall" style={styles.sectionProgressLabel} tabularNums>
                      {`${completedCombinedCount} dari ${totalCombinedCount} tuntas`}
                      {completedMinutes > 0 ? `, ${completedMinutes} menit fokus` : ''}
                    </AppText>
                  )}
                </View>
                <Pressable
                  onPress={() => router.push('/today/new')}
                  accessibilityRole="button"
                  accessibilityLabel="Tambah Tugas Prioritas"
                  style={({ pressed }) => [styles.addButton, pressed && styles.timelineItemPressed]}
                >
                  <Plus size={space[5]} color={s.forest} />
                </Pressable>
              </View>
              {totalCombinedCount > 0 && (
                <View style={styles.headerProgressTrack}>
                  <View
                    style={[
                      styles.headerProgressFill,
                      { width: `${combinedProgressPercent}%` },
                    ]}
                  />
                </View>
              )}
            </View>

            {totalCombinedCount === 0 ? (
              <AppText variant="bodyMedium" color="onSurfaceVariant">
                Belum ada tugas atau agenda untuk hari ini.
              </AppText>
            ) : (
              <View style={styles.timelineContainer}>
                {focusItems.map((item, idx) => {
                  const isLastNode = idx + 1 === totalTimelineNodes;
                  const isCompleted = item.isCompleted;
                  const isCancelled = item.task.status === 'CANCELLED';
                  const isActive = timer.activeTask?.id === item.taskId;

                  const durationLabel = !item.task.estimatedMinutes ? ''
                    : item.task.estimatedMinutes >= 60 && item.task.estimatedMinutes % 60 === 0
                      ? `${item.task.estimatedMinutes / 60} jam`
                      : `${item.task.estimatedMinutes} menit`;

                  let detail = item.task.description
                    ? [durationLabel, item.task.description].filter(Boolean).join(', ')
                    : durationLabel ? `Estimasi fokus ${durationLabel}` : '';
                  if (isCancelled) detail = 'Dibatalkan';
                  else if (isCompleted) detail = 'Selesai dikerjakan';
                  else if (isActive && timer.isRunning) detail = 'Sesi fokus berjalan';

                  const isFromManagedTask =
                    !item.task.targetId && item.task.id.startsWith('mtask-');
                  const accentColor = s.forest;

                  const originKicker = item.task.targetId
                    ? item.task.targetTitle ? `Target, ${item.task.targetTitle}` : 'Dari Target'
                    : isFromManagedTask ? 'Manajemen Tugas, Jadwal Eksekusi'
                      : item.task.quickCategory || 'Tugas hari ini';

                  const handleRowPress = () => {
                    if (item.task.targetId) {
                      router.push({
                        pathname: '/targets/[id]',
                        params: { id: item.task.targetId },
                      });
                    } else if (isFromManagedTask) {
                      router.push('/task-manager' as any);
                    } else if (!isCompleted && !isCancelled) {
                      if (!timer.hasSession) timer.setActiveTask(item.task);
                      setIsTimerExpanded(true);
                    }
                  };

                  return (
                    <View key={item.id} style={styles.timelineItem}>
                      <View style={styles.timelineRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isCompleted}
                            onPress={() => toggleTask(item.taskId, isCompleted || isCancelled)}
                            accessibilityLabel={
                              (isCompleted || isCancelled ? 'Buka kembali ' : 'Selesaikan ') +
                              item.task.title
                            }
                            size={space[6]}
                          />
                        </View>
                        {!isLastNode && (
                          <View
                            style={[
                              styles.timelineSpineLine,
                              isCompleted && styles.timelineSpineLineDone,
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineBody}>
                        <View style={styles.timelineMainRow}>
                          <Pressable onPress={handleRowPress}
                            accessibilityRole="button"
                            accessibilityLabel={`Buka ${originKicker}: ${item.task.title}`} style={({ pressed }) => [styles.timelineTextCol, pressed && styles.timelineItemPressed]}>
                            <View style={styles.kickerInlineRow}>
                              <AppText
                                variant="labelMedium" style={[styles.kickerText, { color: accentColor }]}
                                numberOfLines={largeText ? undefined : 1}
                              >
                                {originKicker}
                              </AppText>
                            </View>
                            <AppText
                              style={[
                                styles.timelineTitle,
                                isCompleted && styles.timelineTitleDone,
                                isCancelled && styles.timelineTitleCancelled,
                              ]}
                              numberOfLines={largeText ? undefined : 2}
                            >
                              {item.task.title}
                            </AppText>
                            {detail ? (
                              <AppText style={styles.timelineSubtext} numberOfLines={largeText ? undefined : 2}>
                                {detail}
                              </AppText>
                            ) : null}
                          </Pressable>
                          <View style={styles.timelineActions}>
                            {isCompleted || isCancelled ? null : isActive && timer.isRunning ? (
                              <Pressable
                                onPress={timer.pauseTimer}
                                accessibilityRole="button"
                                accessibilityLabel={'Jeda fokus ' + item.task.title}
                                hitSlop={0}
                                style={[styles.focusOrbBtn, styles.focusOrbBtnActive]}
                              >
                                <Pause size={space[4]} color={s.ink} strokeWidth={2.6} />
                              </Pressable>
                            ) : (
                              <Pressable
                                onPress={() => {
                                  if (!timer.hasSession) timer.setActiveTask(item.task);
                                  setIsTimerExpanded(true);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={'Mulai fokus ' + item.task.title}
                                hitSlop={0}
                                style={styles.focusOrbBtn}
                              >
                                <Play
                                  size={space[4]}
                                  color={s.forest}
                                  fill={s.forest}
                                  strokeWidth={2.2}
                                />
                              </Pressable>
                            )}

                            <Pressable
                              onPress={() => removeFromToday(item.id)}
                              accessibilityRole="button"
                              accessibilityLabel={'Hapus ' + item.task.title}
                              hitSlop={0}
                              style={styles.dismissBtn}
                            >
                              <X size={space[4]} color={s.inkSubtle} />
                            </Pressable>
                          </View>
                        </View>
                        {!isLastNode && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    </View>
                  );
                })}
                {events.map((ev, idx) => {
                  const isLastNode =
                    focusItems.length + idx + 1 === totalTimelineNodes;
                  const startTime = ev.isAllDay
                    ? 'Sepanjang hari'
                    : new Date(ev.startTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                  const isDone = ev.isCompleted;
                  const agendaColor = s.forest;

                  return (
                    <View key={ev.id} style={styles.timelineItem}>
                      <View style={styles.timelineRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isDone}
                            onPress={() => toggleEvent(ev.id, isDone)}
                            accessibilityLabel={(isDone ? 'Buka kembali ' : 'Selesaikan ') + ev.title}
                            size={space[6]}
                          />
                        </View>
                        {!isLastNode && (
                          <View
                            style={[
                              styles.timelineSpineLine,
                              isDone && styles.timelineSpineLineDone,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.timelineBody}>
                        <View style={styles.timelineMainRow}>
                          <Pressable onPress={() => router.push('/(tabs)/agenda')}
                            accessibilityRole="button"
                            accessibilityLabel={`Buka Agenda: ${ev.title}`} style={({ pressed }) => [styles.timelineTextCol, pressed && styles.timelineItemPressed]}>
                            <View style={styles.kickerInlineRow}>
                              <CalendarDays size={space[3]} color={agendaColor} strokeWidth={2.4} />
                              <AppText variant="labelMedium" style={[styles.kickerText, { color: agendaColor }]}>
                                {`Agenda, ${startTime}`}
                              </AppText>
                            </View>

                            <AppText
                              style={[styles.timelineTitle, isDone && styles.timelineTitleDone]}
                              numberOfLines={1}
                            >
                              {ev.title}
                            </AppText>

                            <AppText style={styles.timelineSubtext} numberOfLines={1}>
                              {ev.location
                                ? `Lokasi: ${ev.location}`
                                : 'Ketuk untuk melihat di Kalender Agenda'}
                            </AppText>
                          </Pressable>
                        </View>

                        {!isLastNode && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    </View>
                  );
                })}
                {activeOccurrences.map((occ, idx) => {
                  const isLastNode =
                    focusItems.length + events.length + idx + 1 ===
                    totalTimelineNodes;
                  const isDone = occ.isCompleted;
                  const routineColor = s.forest;

                  return (
                    <View key={occ.schedule.id} style={styles.timelineItem}>
                      <View style={styles.timelineRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isDone}
                            onPress={() => toggleWeeklyOccurrence(occ.schedule.id, isDone)}
                            accessibilityLabel={
                              (isDone ? 'Buka kembali ' : 'Selesaikan ') + occ.schedule.title
                            }
                            size={space[6]}
                          />
                        </View>
                        {!isLastNode && (
                          <View
                            style={[
                              styles.timelineSpineLine,
                              isDone && styles.timelineSpineLineDone,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.timelineBody}>
                        <View style={styles.timelineMainRow}>
                          <Pressable onPress={() => router.push('/(tabs)/agenda')}
                            accessibilityRole="button"
                            accessibilityLabel={`Buka Jadwal Rutin: ${occ.schedule.title}`} style={({ pressed }) => [styles.timelineTextCol, pressed && styles.timelineItemPressed]}>
                            <View style={styles.kickerInlineRow}>
                              <Repeat size={space[3]} color={routineColor} strokeWidth={2.4} />
                              <AppText variant="labelMedium" style={[styles.kickerText, { color: routineColor }]}>
                                {`Jadwal Rutin, ${occ.schedule.startTime}–${occ.schedule.endTime}`}
                              </AppText>
                            </View>

                            <AppText
                              style={[styles.timelineTitle, isDone && styles.timelineTitleDone]}
                              numberOfLines={1}
                            >
                              {occ.schedule.title}
                            </AppText>

                            <AppText style={styles.timelineSubtext} numberOfLines={1}>
                              Rutinitas mingguan, Ketuk untuk buka kalender
                            </AppText>
                          </Pressable>
                        </View>

                        {!isLastNode && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <PrayerTimesWidget schedule={prayerSchedule} />
          </>
        )
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: { backgroundColor: colors.background },
  scrollContent: { paddingBottom: space[10], gap: space[4] },
  header: {
    paddingTop: space[5],
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space[2],
  },
  greetingTitle: { color: colors.onSurface },
  greetingSubtext: { color: colors.onSurfaceVariant },
  notice: { marginBottom: space[2] },
  loading: { gap: space[3], paddingVertical: space[4] },
  skeletonLong: { width: '75%', height: space[3], borderRadius: radius.sm, backgroundColor: colors.surfaceContainer },
  skeletonShort: { width: '50%', height: space[3], borderRadius: radius.sm, backgroundColor: colors.surfaceContainer },
  ribbon: { borderRadius: radius.lg, backgroundColor: colors.hero, overflow: 'hidden' },
  ribbonPressed: { backgroundColor: colors.primaryHover },
  ribbonBody: { padding: space[5], gap: space[2] },
  ribbonState: { color: colors.onHeroMuted },
  ribbonTitle: { fontFamily: fontFamily.bold, color: colors.onHero },
  ribbonSeam: { flexDirection: 'row', height: space[3], alignItems: 'center', marginHorizontal: -space[1] },
  ribbonNotch: { width: space[3], height: space[3], borderRadius: radius.full, backgroundColor: colors.background },
  ribbonPerforation: { flex: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed', borderColor: colors.heroTrack },
  ribbonStub: { paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: space[4], flexDirection: 'row', gap: space[3], alignItems: 'center', justifyContent: 'space-between' },
  stack: { flexDirection: 'column-reverse', alignItems: 'stretch' },
  ribbonAction: { minHeight: touchTarget.min, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.sm, backgroundColor: s.sun, flexShrink: 1 },
  actionText: { color: s.ink, fontFamily: fontFamily.bold },
  timeColumn: { minWidth: 0, flexShrink: 1, alignItems: 'flex-end' },
  ribbonTime: { color: colors.onHero, fontFamily: fontFamily.bold },
  timeLabel: { color: colors.onHeroMuted },
  sectionHeaderBlock: { gap: space[2] },
  sectionHeaderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  sectionTitleGroup: { flex: 1, gap: space[1] },
  sectionHeading: { color: s.ink },
  sectionProgressLabel: { color: s.inkMuted },
  addButton: { width: touchTarget.min, minHeight: touchTarget.min, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow },
  headerProgressTrack: { height: space[1], borderRadius: radius.pill, backgroundColor: colors.surfaceContainer, overflow: 'hidden' },
  headerProgressFill: { height: '100%', backgroundColor: s.forest },
  timelineContainer: { gap: space[1] },
  timelineItem: { flexDirection: 'row', alignItems: 'stretch', gap: space[2] },
  timelineItemPressed: { backgroundColor: colors.surfaceContainerLow },
  timelineRail: { width: touchTarget.min, alignItems: 'center' },
  checkNodeWrap: { minHeight: touchTarget.min, width: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  timelineSpineLine: { flex: 1, width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  timelineSpineLineDone: { backgroundColor: colors.success },
  timelineBody: { flex: 1, minWidth: 0, paddingVertical: space[1] },
  timelineMainRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: space[1] },
  timelineTextCol: { flexGrow: 1, flexBasis: touchTarget.min * 3, minWidth: 0, minHeight: touchTarget.min, justifyContent: 'center', gap: space[1] },
  kickerInlineRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  kickerText: { fontFamily: fontFamily.medium, flexShrink: 1 },
  timelineTitle: { fontFamily: fontFamily.bold, color: s.ink },
  timelineTitleDone: { textDecorationLine: 'line-through', color: s.inkMuted },
  timelineTitleCancelled: { textDecorationLine: 'line-through', color: s.inkMuted },
  timelineSubtext: { color: s.inkMuted },
  timelineActions: { flexDirection: 'row', marginLeft: 'auto' },
  focusOrbBtn: { width: touchTarget.min, height: touchTarget.min, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  focusOrbBtnActive: { backgroundColor: s.leafSoft },
  dismissBtn: { width: touchTarget.min, height: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  divider: { marginTop: space[2], height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
