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
  SkipForward,
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
import { MinuteDial } from '../components/minute-dial';
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
  const pending = activeItems.filter(item => !item.isCompleted);
  const nextTask = pending[0]?.task;

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

  const picked = pending.find(item => item.taskId === timer.activeTask?.id)?.task;
  const focusTask = timer.hasSession ? timer.activeTask : picked ?? nextTask;
  const followingTask = pending.length > 1
    ? pending[(pending.findIndex(item => item.taskId === focusTask?.id) + 1) % pending.length].task
    : null;
  const emptyTitle = activeItems.length ? 'Semua tugas selesai' : 'Pilih tugas pertama';
  const focusTitle = focusTask?.title ?? (timer.hasSession ? 'Fokus mandiri' : emptyTitle);
  const estimate = pending.find(item => item.taskId === focusTask?.id)?.task.estimatedMinutes;
  const hasEstimate = estimate !== undefined && Number.isFinite(estimate) && estimate > 0;
  const focusState = timer.reflection ? 'Sesi tercatat' : timer.isRunning ? 'Sesi berjalan' : timer.hasSession ? 'Sesi dijeda' : 'Fokus berikutnya';
  const focusAction = timer.hasSession ? 'Lihat sesi fokus' : focusTask ? 'Buka fokus' : 'Pilih tugas';
  const dateLabel = todayDate ? new Date(`${todayDate}T12:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) : '';

  const handleHeroPress = () => {
    if (!focusTask && !timer.hasSession) {
      router.push('/today/new');
      return;
    }
    if (!timer.hasSession && focusTask && timer.activeTask?.id !== focusTask.id) {
      timer.setActiveTask(focusTask);
    }
    setIsTimerExpanded(true);
  };

  // Build total count to know which row is the very last on the timeline spine
  const totalTimelineNodes =
    focusItems.length + events.length + activeOccurrences.length;

  return (
    <Screen
      scrollable
      insideTabs
      style={styles.screenBg}
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
              <View style={styles.clockCase}>
                <View style={[styles.clockFace, largeText && styles.clockFaceLarge]}>
                  <MinuteDial minutes={timer.hasSession ? timer.secondsLeft / 60 : hasEstimate ? estimate : undefined} />
                  <View style={styles.clockCopy} accessibilityLiveRegion={timer.hasSession ? 'none' : 'polite'}>
                    <AppText variant="labelMedium" color="onSurfaceVariant">{focusState}</AppText>
                    <AppText variant="headlineLarge" style={styles.clockTitle}>{focusTitle}</AppText>
                    {timer.hasSession || hasEstimate ? (
                      <AppText variant="labelMedium" color="onSurfaceVariant">
                        {timer.hasSession ? timer.mode === 'STOPWATCH' ? 'Waktu berjalan ' : 'Sisa waktu ' : 'Perkiraan '}
                        <AppText variant="titleSmall" tabularNums color="primary">
                          {timer.hasSession ? timer.formattedTime : `${estimate} menit`}
                        </AppText>
                      </AppText>
                    ) : null}
                  </View>
                </View>
                <View style={styles.clockKeys}>
                  <Pressable accessibilityRole="button" accessibilityLabel={focusAction} accessibilityHint={focusTitle}
                    onPress={handleHeroPress} style={({ pressed }) => [styles.startKey, pressed && styles.keyPressed]}>
                    {focusTask || timer.hasSession
                      ? <Play size={space[4]} color={colors.onPrimary} fill={colors.onPrimary} />
                      : <Plus size={space[5]} color={colors.onPrimary} />}
                    <AppText variant="titleSmall" color="onPrimary">{focusAction}</AppText>
                  </Pressable>
                  {!timer.hasSession && followingTask ? (
                    <Pressable accessibilityRole="button" accessibilityLabel="Ganti tugas fokus"
                      accessibilityHint={followingTask.title} onPress={() => timer.setActiveTask(followingTask)}
                      style={({ pressed }) => [styles.nextKey, pressed && styles.keyPressed]}>
                      <SkipForward size={space[4]} color={colors.clockInk} />
                      <AppText variant="labelLarge" color="onSurface">Ganti tugas</AppText>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}
            {isTimerExpanded && (
              <FocusTimerWidget
                mode={timer.mode}
                formattedTime={timer.formattedTime}
                seconds={timer.secondsLeft}
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
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space[2],
  },
  greetingTitle: { fontFamily: fontFamily.display, color: colors.onSurface },
  greetingSubtext: { color: colors.onSurfaceVariant },
  notice: { marginBottom: space[2] },
  loading: { gap: space[3], paddingVertical: space[4] },
  skeletonLong: { width: '75%', height: space[3], borderRadius: radius.sm, backgroundColor: colors.surfaceContainer },
  skeletonShort: { width: '50%', height: space[3], borderRadius: radius.sm, backgroundColor: colors.surfaceContainer },
  clockCase: { backgroundColor: colors.clockCase, padding: space[3], gap: space[3], borderRadius: radius.xl, borderTopRightRadius: space[10], borderBottomWidth: space[1], borderColor: colors.clockEdge },
  clockFace: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[1] },
  clockFaceLarge: { flexDirection: 'column', alignItems: 'flex-start' },
  clockCopy: { flexShrink: 1, minWidth: 0, gap: space[1] },
  clockTitle: { fontFamily: fontFamily.display, color: colors.clockInk },
  clockKeys: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  startKey: { flexGrow: 1, minHeight: touchTarget.min, borderRadius: radius.md, paddingHorizontal: space[3], paddingVertical: space[2], backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  nextKey: { minHeight: touchTarget.min, paddingHorizontal: space[3], borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], borderWidth: StyleSheet.hairlineWidth, borderColor: colors.clockEdge, backgroundColor: colors.folderMint },
  keyPressed: { opacity: 0.82 },
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
