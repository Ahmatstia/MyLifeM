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
  Check,
  Pause,
  Play,
  Plus,
  Repeat,
  SkipForward,
  X,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { todayColors as c } from '@/theme/today';
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
  const [planFilter, setPlanFilter] = useState<'ALL' | 'OPEN' | 'DONE'>('ALL');
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

  const matchesFilter = (completed: boolean) => planFilter === 'ALL' || (planFilter === 'DONE' ? completed : !completed);
  const visibleTasks = focusItems.filter(item => matchesFilter(item.isCompleted));
  const visibleEvents = events.filter(item => matchesFilter(item.isCompleted));
  const visibleRoutines = activeOccurrences.filter(item => matchesFilter(item.isCompleted));
  const visibleCount = visibleTasks.length + visibleEvents.length + visibleRoutines.length;

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
        <View style={styles.headerCopy}>
          <AppText variant="displayMedium" accessibilityRole="header" style={styles.greetingTitle}>Hari ini</AppText>
          {dateLabel ? <AppText variant="labelLarge" style={styles.greetingSubtext}>{dateLabel}</AppText> : null}
        </View>
        <Pressable onPress={() => router.push('/(tabs)/agenda')}
          accessibilityRole="button" accessibilityLabel="Buka kalender"
          style={({ pressed }) => [styles.dateStamp, pressed && styles.keyPressed]}>
          <CalendarDays size={24} color={c.ink} strokeWidth={2} />
        </Pressable>
      </View>
      <PrayerTimesWidget schedule={prayerSchedule} />

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
                  <MinuteDial size={60} minutes={timer.hasSession ? timer.secondsLeft / 60 : hasEstimate ? estimate : undefined} />
                  <View style={styles.clockCopy} accessibilityLiveRegion={timer.hasSession ? 'none' : 'polite'}>
                    <AppText variant="labelMedium" color={c.skyInk}>{focusState}</AppText>
                    <AppText variant="headlineSmall" style={styles.clockTitle}>{focusTitle}</AppText>
                    {timer.hasSession || hasEstimate ? (
                      <AppText variant="labelMedium" color="onSurfaceVariant">
                        {timer.hasSession ? timer.mode === 'STOPWATCH' ? 'Waktu berjalan ' : 'Sisa waktu ' : 'Perkiraan '}
                        <AppText variant="titleSmall" tabularNums color={c.skyInk}>
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
                      ? <Play size={space[4]} color={c.card} fill={colors.onPrimary} />
                      : <Plus size={space[5]} color={c.card} />}
                    <AppText variant="titleSmall" color={c.card}>{focusAction}</AppText>
                  </Pressable>
                  {!timer.hasSession && followingTask ? (
                    <Pressable accessibilityRole="button" accessibilityLabel="Ganti tugas fokus"
                      accessibilityHint={followingTask.title} onPress={() => timer.setActiveTask(followingTask)}
                      style={({ pressed }) => [styles.nextKey, pressed && styles.keyPressed]}>
                      <SkipForward size={space[4]} color={c.skyInk} />
                      <AppText variant="labelLarge" color={c.skyInk}>Ganti tugas</AppText>
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
                  style={({ pressed }) => [styles.addButton, pressed && styles.keyPressed]}
                >
                  <Plus size={space[5]} color={c.ink} />
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

            <View style={styles.filterRow}>
              {([
                ['ALL', 'Semua'],
                ['OPEN', 'Belum selesai'],
                ['DONE', 'Selesai'],
              ] as const).map(([value, label]) => (
                <Pressable key={value} onPress={() => setPlanFilter(value)}
                  accessibilityRole="button" accessibilityState={{ selected: planFilter === value }}
                  style={({ pressed }) => [styles.filter, planFilter === value && styles.selectedFilter, pressed && styles.keyPressed]}>
                  {value === 'DONE' && <Check size={14} color={planFilter === value ? c.card : c.muted} />}
                  <AppText variant="labelMedium" color={planFilter === value ? c.card : c.muted}>{label}</AppText>
                </Pressable>
              ))}
            </View>
            {visibleCount === 0 ? (
              <View style={styles.emptyPlan}>
                <View style={styles.emptyIcon}><Check size={24} color={c.mintInk} /></View>
                <AppText variant="titleMedium" color={c.ink}>
                  {totalCombinedCount === 0 ? 'Hari ini masih terbuka' : planFilter === 'DONE' ? 'Satu langkah dulu, yuk' : 'Rencana hari ini sudah tuntas'}
                </AppText>
                <AppText color={c.muted} align="center">
                  {totalCombinedCount === 0 ? 'Pilih satu hal kecil yang ingin kamu selesaikan.' : planFilter === 'DONE' ? 'Aktivitas yang selesai akan terkumpul di sini.' : 'Ada ruang untuk istirahat atau rencana baru.'}
                </AppText>
                {totalCombinedCount === 0 && (
                  <Pressable accessibilityRole="button" onPress={() => router.push('/today/new')}
                    style={({ pressed }) => [styles.emptyAction, pressed && styles.keyPressed]}>
                    <Plus size={18} color={c.ink} /><AppText variant="titleSmall" color={c.ink}>Tambah rencana</AppText>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.planList}>
                {visibleTasks.map((item) => {
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
                  const accentColor = c.lilacInk;

                  const originKicker = item.task.targetId
                    ? item.task.targetTitle ? `Target, ${item.task.targetTitle}` : 'Dari Target'
                    : isFromManagedTask ? 'Tugas terjadwal'
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
                    <View key={item.id} style={[styles.planCard, styles.taskCard, (isCompleted || isCancelled) && styles.completedCard]}>
                      <View style={styles.checkRail}>
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
                      </View>
                      <View style={styles.planBody}>
                        <View style={styles.planMain}>
                          <Pressable onPress={handleRowPress}
                            accessibilityRole="button"
                            accessibilityLabel={`Buka ${originKicker}: ${item.task.title}`} style={({ pressed }) => [styles.planText, pressed && styles.keyPressed]}>
                            <View style={styles.categoryRow}>
                              <AppText
                                variant="labelMedium" style={[styles.categoryText, { color: accentColor }]}
                                numberOfLines={largeText ? undefined : 1}
                              >
                                {originKicker}
                              </AppText>
                            </View>
                            <AppText
                              style={[
                                styles.planTitle,
                                isCompleted && styles.planTitleDone,
                                isCancelled && styles.planTitleCancelled,
                              ]}
                              numberOfLines={largeText ? undefined : 2}
                            >
                              {item.task.title}
                            </AppText>
                            {detail ? (
                              <AppText style={styles.planDetail} numberOfLines={largeText ? undefined : 2}>
                                {detail}
                              </AppText>
                            ) : null}
                          </Pressable>
                          <View style={styles.planActions}>
                            {isCompleted || isCancelled ? null : isActive && timer.isRunning ? (
                              <Pressable
                                onPress={timer.pauseTimer}
                                accessibilityRole="button"
                                accessibilityLabel={'Jeda fokus ' + item.task.title}
                                hitSlop={0}
                                style={[styles.focusOrbBtn, styles.focusOrbBtnActive]}
                              >
                                <Pause size={space[4]} color={c.ink} strokeWidth={2.6} /><AppText variant="labelMedium" color={c.ink}>Jeda</AppText>
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
                                style={({ pressed }) => [styles.focusOrbBtn, pressed && styles.keyPressed]}
                              >
                                <Play
                                  size={space[4]}
                                  color={c.ink}
                                  fill={c.ink}
                                  strokeWidth={2.2}
                                />
                                <AppText variant="labelMedium" color={c.ink}>Fokus</AppText>
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
                      </View>
                    </View>
                  );
                })}
                {visibleEvents.map((ev) => {
                  const startTime = ev.isAllDay
                    ? 'Sepanjang hari'
                    : new Date(ev.startTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                  const isDone = ev.isCompleted;
                  const agendaColor = c.peachInk;

                  return (
                    <View key={ev.id} style={[styles.planCard, styles.agendaCard, isDone && styles.completedCard]}>
                      <View style={styles.checkRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isDone}
                            onPress={() => toggleEvent(ev.id, isDone)}
                            accessibilityLabel={(isDone ? 'Buka kembali ' : 'Selesaikan ') + ev.title}
                            size={space[6]}
                          />
                        </View>
                      </View>

                      <View style={styles.planBody}>
                        <View style={styles.planMain}>
                          <Pressable onPress={() => router.push('/(tabs)/agenda')}
                            accessibilityRole="button"
                            accessibilityLabel={`Buka Agenda: ${ev.title}`} style={({ pressed }) => [styles.planText, pressed && styles.keyPressed]}>
                            <View style={styles.categoryRow}>
                              <CalendarDays size={space[3]} color={agendaColor} strokeWidth={2.4} />
                              <AppText variant="labelMedium" style={[styles.categoryText, { color: agendaColor }]}>
                                {`Agenda, ${startTime}`}
                              </AppText>
                            </View>

                            <AppText
                              style={[styles.planTitle, isDone && styles.planTitleDone]}
                              numberOfLines={largeText ? undefined : 2}
                            >
                              {ev.title}
                            </AppText>

                            <AppText style={styles.planDetail} numberOfLines={largeText ? undefined : 2}>
                              {ev.location
                                ? `${ev.location}`
                                : 'Lihat di kalender'}
                            </AppText>
                          </Pressable>
                        </View>

                      </View>
                    </View>
                  );
                })}
                {visibleRoutines.map((occ) => {
                  const isDone = occ.isCompleted;
                  const routineColor = c.skyInk;

                  return (
                    <View key={occ.schedule.id} style={[styles.planCard, styles.routineCard, isDone && styles.completedCard]}>
                      <View style={styles.checkRail}>
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
                      </View>

                      <View style={styles.planBody}>
                        <View style={styles.planMain}>
                          <Pressable onPress={() => router.push('/(tabs)/agenda')}
                            accessibilityRole="button"
                            accessibilityLabel={`Buka Jadwal Rutin: ${occ.schedule.title}`} style={({ pressed }) => [styles.planText, pressed && styles.keyPressed]}>
                            <View style={styles.categoryRow}>
                              <Repeat size={space[3]} color={routineColor} strokeWidth={2.4} />
                              <AppText variant="labelMedium" style={[styles.categoryText, { color: routineColor }]}>
                                {`Jadwal Rutin, ${occ.schedule.startTime}–${occ.schedule.endTime}`}
                              </AppText>
                            </View>

                            <AppText
                              style={[styles.planTitle, isDone && styles.planTitleDone]}
                              numberOfLines={largeText ? undefined : 2}
                            >
                              {occ.schedule.title}
                            </AppText>

                            <AppText style={styles.planDetail} numberOfLines={largeText ? undefined : 2}>
                              Lihat jadwal rutin
                            </AppText>
                          </Pressable>
                        </View>

                      </View>
                    </View>
                  );
                })}
              </View>
            )}

          </>
        )
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: { backgroundColor: c.paper },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] },
  headerCopy: { flex: 1, gap: space[1] },
  dateStamp: { width: 48, height: 48, borderRadius: 18, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '6deg' }] },
  greetingTitle: { fontFamily: fontFamily.display, color: c.ink },
  greetingSubtext: { color: c.muted },
  notice: { marginBottom: space[2] },
  loading: { gap: space[3], paddingVertical: space[4] },
  skeletonLong: { width: '75%', height: space[3], borderRadius: radius.sm, backgroundColor: c.line },
  skeletonShort: { width: '50%', height: space[3], borderRadius: radius.sm, backgroundColor: c.line },
  clockCase: { backgroundColor: c.sky, padding: space[3], gap: space[3], borderRadius: radius.xxl },
  clockFace: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  clockFaceLarge: { flexDirection: 'column', alignItems: 'flex-start' },
  clockCopy: { flexShrink: 1, minWidth: 0, gap: space[1] },
  clockTitle: { fontFamily: fontFamily.display, color: c.ink },
  clockKeys: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  startKey: { flexGrow: 1, minHeight: touchTarget.min, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[2], backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  nextKey: { minHeight: touchTarget.min, paddingHorizontal: space[3], borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], backgroundColor: '#EAF5F7' },
  keyPressed: { opacity: 0.72 },
  sectionHeaderBlock: { gap: space[3], marginTop: space[1] },
  sectionHeaderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  sectionTitleGroup: { flex: 1, gap: space[1] },
  sectionHeading: { color: c.ink, fontFamily: fontFamily.display },
  sectionProgressLabel: { color: c.muted },
  addButton: { width: touchTarget.min, minHeight: touchTarget.min, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: c.gold },
  headerProgressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: c.line, overflow: 'hidden' },
  headerProgressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.mintInk },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] },
  filter: { minHeight: touchTarget.min, paddingHorizontal: space[3], paddingVertical: space[2], borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', gap: space[1], flexDirection: 'row' },
  selectedFilter: { backgroundColor: c.ink },
  emptyPlan: { padding: space[5], borderRadius: radius.xxl, backgroundColor: c.card, alignItems: 'center', gap: space[2] },
  emptyIcon: { backgroundColor: c.mint, borderRadius: radius.full, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  emptyAction: { minHeight: touchTarget.min, borderRadius: radius.pill, backgroundColor: c.gold, flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[4], marginTop: space[2] },
  planList: { gap: space[3] },
  planCard: { flexDirection: 'row', alignItems: 'flex-start', padding: space[3], gap: space[2], borderRadius: radius.xl },
  taskCard: { backgroundColor: c.lilac },
  agendaCard: { backgroundColor: c.peach },
  routineCard: { backgroundColor: c.sky },
  completedCard: { backgroundColor: c.completed },
  checkRail: { width: touchTarget.min, alignItems: 'center' },
  checkNodeWrap: { minHeight: touchTarget.min, width: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  planBody: { flex: 1, minWidth: 0 },
  planMain: { gap: space[2] },
  planText: { minHeight: touchTarget.min, justifyContent: 'center', gap: space[1] },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  categoryText: { fontFamily: fontFamily.medium, flexShrink: 1 },
  planTitle: { fontFamily: fontFamily.display, fontSize: 18, lineHeight: 24, color: c.ink },
  planTitleDone: { textDecorationLine: 'line-through', color: c.muted },
  planTitleCancelled: { textDecorationLine: 'line-through', color: c.muted },
  planDetail: { color: c.muted, fontSize: 12, lineHeight: 18 },
  planActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[2] },
  focusOrbBtn: { minHeight: touchTarget.min, paddingHorizontal: space[3], borderRadius: radius.pill, gap: space[2], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.card },
  focusOrbBtnActive: { backgroundColor: c.gold },
  dismissBtn: { width: touchTarget.min, height: touchTarget.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
});
