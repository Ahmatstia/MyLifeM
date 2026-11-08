import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  FolderKanban,
  Pause,
  Play,
  Plus,
  Repeat,
  Sparkles,
  Target,
  X,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, space } from '@/theme/tokens';
import {
  AppText,
  Banner,
  EmptyState,
  HeroBlob,
  MascotPeek,
  Screen,
  SproutCheck,
  SproutPlant,
  WaveBackdrop,
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
  const {
    focusItems,
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
  const remainingCount = Math.max(0, activeItems.length - completedCount);
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
          <View style={styles.floatingFabContainer} pointerEvents="box-none">
            <Pressable
              onPress={() => router.push('/today/new')}
              accessibilityRole="button"
              accessibilityLabel="Tambah Tugas Prioritas"
              style={({ pressed }) => [
                styles.fabSquare,
                pressed && styles.fabSquarePressed,
              ]}
            >
              <Plus size={24} color={s.ink} strokeWidth={2.8} />
            </Pressable>
          </View>

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
      <WaveBackdrop variant="home" height={285} />

      {/* 1. Storybook Greeting Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <AppText variant="headlineMedium" style={styles.greetingTitle}>
            Halo, Pejuang!
          </AppText>
          <AppText variant="bodySmall" style={styles.greetingSubtext}>
            Hari ini yuk, lebih produktif{'\n'}dari kemarin ✨
          </AppText>
        </View>
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
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={s.forest} />
          <AppText color="onSurfaceVariant">Menyiapkan harimu…</AppText>
        </View>
      ) : (
        !error && (
          <>
            {/* 2. Wavy Forest Green Hero Banner with Peeking Mascot */}
            <View style={styles.heroWrap}>
              <View style={styles.sproutLeftBadge} pointerEvents="none">
                <SproutPlant size={36} />
              </View>
              <View style={styles.mascotPeekWrap} pointerEvents="none">
                <MascotPeek width={152} height={109} />
              </View>

              <HeroBlob
                onPress={handleHeroPress}
                accessibilityLabel={timer.hasSession ? 'Lihat sesi fokus' : 'Mulai sesi fokus'}
                style={styles.heroBlob}
              >
                <View style={styles.heroInnerRow}>
                  <View style={styles.heroTextCol}>
                    <AppText style={styles.heroBigNum}>{activeItems.length || 0}</AppText>
                    <AppText style={styles.heroLabel}>Target Aktif</AppText>
                    <AppText style={styles.heroStatusSub}>
                      {timer.reflection
                        ? 'SESI TERCATAT'
                        : timer.isRunning
                          ? `SESI BERJALAN · ${timer.formattedTime}`
                          : timer.hasSession
                            ? `SESI SEDANG DIJEDA · Lihat sesi fokus`
                            : completedMinutes > 0
                              ? `${completedMinutes} menit fokus hari ini`
                              : `${remainingCount} tugas siap dikerjakan`}
                    </AppText>
                  </View>

                  <View style={styles.heroCircleArrow}>
                    <ArrowRight size={17} color={s.forest} strokeWidth={2.8} />
                  </View>
                </View>
              </HeroBlob>
            </View>

            {/* Expanded Focus Timer Widget when opened */}
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

            {/* 3. Jadwal Shalat & Azan Widget (Right below Target Aktif) */}
            <PrayerTimesWidget schedule={prayerSchedule} />

            {/* 4. Unified Section: Hari Ini — Editorial Timeline Flow (No Cards, No Pill Badges) */}
            <View style={styles.sectionHeaderBlock}>
              <View style={styles.sectionHeaderTop}>
                <View style={styles.sectionTitleGroup}>
                  <AppText style={styles.sectionHeading}>Hari Ini</AppText>
                  {totalCombinedCount > 0 && (
                    <AppText style={styles.sectionProgressLabel} tabularNums>
                      {`${completedCombinedCount} dari ${totalCombinedCount} tuntas`}
                    </AppText>
                  )}
                </View>
              </View>

              {/* Thin Organic Progress Thread under Section Header */}
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
              <EmptyState
                title="Mulai dari satu langkah"
                description="Pilih tugas penting dari target/proyek, buat tugas kilat, atau jadwalkan agenda hari ini."
                actionTitle="Pilih prioritas"
                customIcon={<Sparkles size={28} color={s.forest} strokeWidth={2.2} />}
                onActionPress={() => router.push('/today/new')}
              />
            ) : (
              <View style={styles.timelineContainer}>
                {/* A. Fokus Tugas (dari Target, Proyek, atau Hari Ini) */}
                {focusItems.map((item, idx) => {
                  const isLastNode = idx + 1 === totalTimelineNodes;
                  const isCompleted = item.isCompleted;
                  const isCancelled = item.task.status === 'CANCELLED';
                  const isActive = timer.activeTask?.id === item.taskId;

                  const durationLabel =
                    item.task.estimatedMinutes >= 60 && item.task.estimatedMinutes % 60 === 0
                      ? `${item.task.estimatedMinutes / 60} jam`
                      : `${item.task.estimatedMinutes} menit`;

                  const isFromTarget = Boolean(item.task.targetId);
                  const isFromProject = !isFromTarget && Boolean(item.task.projectId);

                  const accentColor = s.forest;

                  const originKicker = isFromTarget
                    ? item.task.targetTitle
                      ? `Target · ${item.task.targetTitle}`
                      : 'Dari Target'
                    : isFromProject
                      ? item.task.projectTitle
                        ? `Proyek · ${item.task.projectTitle}`
                        : 'Dari Proyek'
                      : 'Fokus Hari Ini';

                  const handleRowPress = () => {
                    if (item.task.targetId) {
                      router.push({
                        pathname: '/targets/[id]',
                        params: { id: item.task.targetId },
                      });
                    } else if (item.task.projectId) {
                      router.push({
                        pathname: '/projects/[id]',
                        params: { id: item.task.projectId },
                      });
                    } else if (!isCompleted && !isCancelled) {
                      if (!timer.hasSession) timer.setActiveTask(item.task);
                      setIsTimerExpanded(true);
                    }
                  };

                  return (
                    <Pressable
                      key={item.id}
                      onPress={handleRowPress}
                      accessibilityRole="button"
                      accessibilityLabel={`Buka ${originKicker}: ${item.task.title}`}
                      style={({ pressed }) => [
                        styles.timelineItem,
                        pressed && styles.timelineItemPressed,
                      ]}
                    >
                      {/* Left Column: Timeline Node + Continuous Vertical Spine */}
                      <View style={styles.timelineRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isCompleted}
                            onPress={() => toggleTask(item.taskId, isCompleted || isCancelled)}
                            accessibilityLabel={
                              (isCompleted || isCancelled ? 'Buka kembali ' : 'Selesaikan ') +
                              item.task.title
                            }
                            size={26}
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

                      {/* Right Column: Editorial Content + Dashed Notebook Divider */}
                      <View style={styles.timelineBody}>
                        <View style={styles.timelineMainRow}>
                          <View style={styles.timelineTextCol}>
                            {/* Plain Editorial Kicker Line (No Badge Box!) */}
                            <View style={styles.kickerInlineRow}>
                              {isFromTarget ? (
                                <Target size={11} color={accentColor} strokeWidth={2.4} />
                              ) : isFromProject ? (
                                <FolderKanban size={11} color={accentColor} strokeWidth={2.4} />
                              ) : (
                                <Sparkles size={11} color={accentColor} strokeWidth={2.4} />
                              )}
                              <AppText
                                style={[styles.kickerText, { color: accentColor }]}
                                numberOfLines={1}
                              >
                                {originKicker}
                              </AppText>
                              {(isFromTarget || isFromProject) && (
                                <ArrowUpRight size={11} color={accentColor} strokeWidth={2.4} />
                              )}
                            </View>

                            {/* Main Title */}
                            <AppText
                              style={[
                                styles.timelineTitle,
                                isCompleted && styles.timelineTitleDone,
                                isCancelled && styles.timelineTitleCancelled,
                              ]}
                              numberOfLines={2}
                            >
                              {item.task.title}
                            </AppText>

                            {/* Subtitle / Duration & Status */}
                            <AppText style={styles.timelineSubtext} numberOfLines={1}>
                              {isCancelled
                                ? 'Dibatalkan'
                                : isCompleted
                                  ? `${durationLabel} · Selesai dikerjakan`
                                  : isActive
                                    ? `${durationLabel} · Sesi fokus sedang berjalan`
                                    : item.task.description
                                      ? `${durationLabel} · ${item.task.description}`
                                      : `Estimasi fokus ${durationLabel}`}
                            </AppText>
                          </View>

                          {/* Right Actions: Tactile Play/Pause Circle & Subtle Remove */}
                          <View style={styles.timelineActions}>
                            {isCompleted || isCancelled ? null : isActive ? (
                              <Pressable
                                onPress={timer.pauseTimer}
                                accessibilityRole="button"
                                accessibilityLabel={'Jeda fokus ' + item.task.title}
                                hitSlop={6}
                                style={[styles.focusOrbBtn, styles.focusOrbBtnActive]}
                              >
                                <Pause size={14} color={s.ink} strokeWidth={2.6} />
                              </Pressable>
                            ) : (
                              <Pressable
                                onPress={() => {
                                  if (!timer.hasSession) timer.setActiveTask(item.task);
                                  setIsTimerExpanded(true);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={'Mulai fokus ' + item.task.title}
                                hitSlop={6}
                                style={styles.focusOrbBtn}
                              >
                                <Play
                                  size={13}
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
                              hitSlop={8}
                              style={styles.dismissBtn}
                            >
                              <X size={13.5} color={s.inkSubtle} />
                            </Pressable>
                          </View>
                        </View>

                        {/* Hand-drawn Dashed Divider Line */}
                        {!isLastNode && (
                          <View style={styles.dashedDividerWrap} pointerEvents="none">
                            <Svg width="100%" height={2}>
                              <Line
                                x1="0"
                                y1="1"
                                x2="100%"
                                y2="1"
                                stroke="#E3DAC3"
                                strokeWidth={1.2}
                                strokeDasharray="5 5"
                              />
                            </Svg>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}

                {/* B. Kegiatan Agenda Harian */}
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
                    <Pressable
                      key={ev.id}
                      onPress={() => router.push('/(tabs)/agenda')}
                      accessibilityRole="button"
                      accessibilityLabel={`Buka Agenda: ${ev.title}`}
                      style={({ pressed }) => [
                        styles.timelineItem,
                        pressed && styles.timelineItemPressed,
                      ]}
                    >
                      <View style={styles.timelineRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isDone}
                            onPress={() => toggleEvent(ev.id, isDone)}
                            accessibilityLabel={(isDone ? 'Buka kembali ' : 'Selesaikan ') + ev.title}
                            size={26}
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
                          <View style={styles.timelineTextCol}>
                            <View style={styles.kickerInlineRow}>
                              <CalendarDays size={11} color={agendaColor} strokeWidth={2.4} />
                              <AppText style={[styles.kickerText, { color: agendaColor }]}>
                                {`Agenda · ${startTime}`}
                              </AppText>
                              <ArrowUpRight size={11} color={agendaColor} strokeWidth={2.4} />
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
                          </View>
                        </View>

                        {!isLastNode && (
                          <View style={styles.dashedDividerWrap} pointerEvents="none">
                            <Svg width="100%" height={2}>
                              <Line
                                x1="0"
                                y1="1"
                                x2="100%"
                                y2="1"
                                stroke="#E3DAC3"
                                strokeWidth={1.2}
                                strokeDasharray="5 5"
                              />
                            </Svg>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}

                {/* C. Jadwal Rutin Mingguan */}
                {activeOccurrences.map((occ, idx) => {
                  const isLastNode =
                    focusItems.length + events.length + idx + 1 ===
                    totalTimelineNodes;
                  const isDone = occ.isCompleted;
                  const routineColor = s.forest;

                  return (
                    <Pressable
                      key={occ.schedule.id}
                      onPress={() => router.push('/(tabs)/agenda')}
                      accessibilityRole="button"
                      accessibilityLabel={`Buka Jadwal Rutin: ${occ.schedule.title}`}
                      style={({ pressed }) => [
                        styles.timelineItem,
                        pressed && styles.timelineItemPressed,
                      ]}
                    >
                      <View style={styles.timelineRail}>
                        <View style={styles.checkNodeWrap}>
                          <SproutCheck
                            checked={isDone}
                            onPress={() => toggleWeeklyOccurrence(occ.schedule.id, isDone)}
                            accessibilityLabel={
                              (isDone ? 'Buka kembali ' : 'Selesaikan ') + occ.schedule.title
                            }
                            size={26}
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
                          <View style={styles.timelineTextCol}>
                            <View style={styles.kickerInlineRow}>
                              <Repeat size={11} color={routineColor} strokeWidth={2.4} />
                              <AppText style={[styles.kickerText, { color: routineColor }]}>
                                {`Jadwal Rutin · ${occ.schedule.startTime}–${occ.schedule.endTime}`}
                              </AppText>
                              <ArrowUpRight size={11} color={routineColor} strokeWidth={2.4} />
                            </View>

                            <AppText
                              style={[styles.timelineTitle, isDone && styles.timelineTitleDone]}
                              numberOfLines={1}
                            >
                              {occ.schedule.title}
                            </AppText>

                            <AppText style={styles.timelineSubtext} numberOfLines={1}>
                              Rutinitas mingguan · Ketuk untuk buka kalender
                            </AppText>
                          </View>
                        </View>

                        {!isLastNode && (
                          <View style={styles.dashedDividerWrap} pointerEvents="none">
                            <Svg width="100%" height={2}>
                              <Line
                                x1="0"
                                y1="1"
                                x2="100%"
                                y2="1"
                                stroke="#E3DAC3"
                                strokeWidth={1.2}
                                strokeDasharray="5 5"
                              />
                            </Svg>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={{ height: space[16] }} />
          </>
        )
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: s.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: space[3],
    paddingBottom: space[2],
  },
  headerTextCol: {
    gap: 4,
    flex: 1,
  },
  greetingTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 32,
    color: s.ink,
  },
  greetingSubtext: {
    fontFamily: fontFamily.medium,
    color: '#3B564B',
    fontSize: 13,
    lineHeight: 19,
  },
  notice: {
    marginBottom: space[2],
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingVertical: space[10],
  },
  scrollContent: {
    paddingBottom: 100,
    gap: space[3],
  },
  heroWrap: {
    marginTop: 68,
    marginBottom: space[1],
    position: 'relative',
  },
  sproutLeftBadge: {
    position: 'absolute',
    top: -19,
    left: 20,
    zIndex: 3,
  },
  mascotPeekWrap: {
    position: 'absolute',
    top: -82,
    right: 12,
    zIndex: 3,
  },
  heroBlob: {
    minHeight: 116,
  },
  heroInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    gap: 2,
    flex: 1,
  },
  heroBigNum: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 38,
    color: '#FFFFFF',
  },
  heroLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  heroStatusSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: '#D5EBDD',
    marginTop: 2,
  },
  heroCircleArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderBlock: {
    paddingTop: space[2],
    gap: 8,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    lineHeight: 24,
    color: s.ink,
  },
  sectionProgressLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: s.forest,
  },
  sectionActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionTextPrimary: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: s.forest,
  },
  actionSeparator: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: '#C9BEA4',
  },
  actionTextSecondary: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: s.forest,
  },
  headerProgressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: '#E7DEC8',
    overflow: 'hidden',
  },
  headerProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: s.forest,
  },
  timelineContainer: {
    paddingTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  timelineItemPressed: {
    opacity: 0.72,
  },
  timelineRail: {
    width: 28,
    alignItems: 'center',
  },
  checkNodeWrap: {
    paddingTop: 2,
    zIndex: 2,
  },
  timelineSpineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#DFD6C0',
    marginVertical: 4,
    borderRadius: 1,
  },
  timelineSpineLineDone: {
    backgroundColor: '#9CC964',
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 14,
  },
  timelineMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineTextCol: {
    flex: 1,
    gap: 2,
  },
  kickerInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kickerText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  timelineTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 21,
    color: s.ink,
  },
  timelineTitleDone: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  timelineTitleCancelled: {
    textDecorationLine: 'line-through',
    color: s.inkSubtle,
  },
  timelineSubtext: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: s.inkMuted,
  },
  timelineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusOrbBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusOrbBtnActive: {
    backgroundColor: s.sun,
  },
  dismissBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedDividerWrap: {
    marginTop: 14,
  },
  floatingFabContainer: {
    position: 'absolute',
    right: space[4],
    bottom: space[4],
    zIndex: 20,
  },
  fabSquare: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: s.sun,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B58105',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: s.sunDeep,
  },
});
