import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import {
  Pause,
  Sparkles,
  X,
  Plus,
  Clock,
  CalendarDays,
  Repeat,
  ArrowRight,
  Dumbbell,
} from 'lucide-react-native';
import { space, fontFamily } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import {
  Screen,
  AppText,
  Banner,
  EmptyState,
  WaveBackdrop,
  SoftCard,
  HeroBlob,
  SproutCheck,
  IconTile,
  SectionTitle,
  MascotPeek,
  SproutPlant,
} from '@/shared/ui';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { useAgenda } from '@/features/agenda/presentation/hooks/use-agenda';
import { usePrayerTimes } from '@/features/prayer-times/presentation/hooks/use-prayer-times';
import { PrayerTimesWidget } from '@/features/prayer-times/presentation/components/prayer-times-widget';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { AddPriorityModal } from '../components/add-priority-modal';
import { SessionReflectionModal } from '../components/session-reflection-modal';

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

  return (
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <>
          {/* Square Floating Action Button in Bottom Right */}
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

      {/* 1. Storybook Greeting Header (Tanpa profil, ikut ter-scroll penuh dari atas) */}
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
                <MascotPeek width={152} height={114} />
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

            {/* 3. Section: Hari Ini (Pillow-Soft Task Cards matching Reference UI) */}
            <SectionTitle
              title="Hari Ini"
              actionLabel="Selengkapnya"
              onAction={() => router.push('/today/new')}
            />

            {focusItems.length === 0 ? (
              <EmptyState
                title="Mulai dari satu langkah"
                description="Pilih tugas penting dari roadmap atau buat tugas kilat baru."
                actionTitle="Pilih prioritas"
                customIcon={<Sparkles size={28} color={s.forest} strokeWidth={2.2} />}
                onActionPress={() => router.push('/today/new')}
              />
            ) : (
              <View style={styles.cardStack}>
                {focusItems.map((item, idx) => {
                  const isCompleted = item.isCompleted;
                  const isCancelled = item.task.status === 'CANCELLED';
                  const isActive = timer.activeTask?.id === item.taskId;

                  const categoryLabel =
                    item.task.priority === 'HIGH'
                      ? 'Prioritas Utama'
                      : item.task.priority === 'LOW'
                        ? 'Ringan'
                        : 'Fokus Harian';

                  const durationLabel =
                    item.task.estimatedMinutes >= 60 && item.task.estimatedMinutes % 60 === 0
                      ? `${item.task.estimatedMinutes / 60} jam`
                      : `${item.task.estimatedMinutes} menit`;

                  const RightIcon = idx % 2 === 0 ? Clock : Dumbbell;

                  return (
                    <SoftCard key={item.id} style={styles.taskCard}>
                      <View style={styles.taskCardRow}>
                        <SproutCheck
                          checked={isCompleted}
                          onPress={() => toggleTask(item.taskId, isCompleted || isCancelled)}
                          accessibilityLabel={
                            (isCompleted || isCancelled ? 'Buka kembali ' : 'Selesaikan ') +
                            item.task.title
                          }
                          size={30}
                        />

                        <View style={styles.taskCenterCol}>
                          <AppText
                            style={[
                              styles.taskTitle,
                              isCompleted && styles.taskTitleDone,
                              isCancelled && styles.taskTitleCancelled,
                            ]}
                            numberOfLines={2}
                          >
                            {item.task.title}
                          </AppText>
                          <AppText style={styles.taskSubtext} numberOfLines={1}>
                            {isCancelled
                              ? 'Dibatalkan'
                              : isCompleted
                                ? `${durationLabel} · Selesai`
                                : isActive
                                  ? `${durationLabel} · Sedang fokus`
                                  : `${durationLabel} · ${item.task.description || categoryLabel}`}
                          </AppText>
                        </View>

                        <View style={styles.taskRightActions}>
                          {isCompleted || isCancelled ? null : isActive ? (
                            <IconTile
                              icon={Pause}
                              tone="sun"
                              size={44}
                              onPress={timer.pauseTimer}
                              accessibilityLabel={'Jeda fokus ' + item.task.title}
                            />
                          ) : (
                            <IconTile
                              icon={RightIcon}
                              tone="leaf"
                              size={44}
                              onPress={() => {
                                if (!timer.hasSession) timer.setActiveTask(item.task);
                                setIsTimerExpanded(true);
                              }}
                              accessibilityLabel={'Mulai fokus ' + item.task.title}
                            />
                          )}

                          <Pressable
                            onPress={() => removeFromToday(item.id)}
                            accessibilityRole="button"
                            accessibilityLabel={'Hapus ' + item.task.title}
                            hitSlop={8}
                            style={styles.removeMiniBtn}
                          >
                            <X size={14} color={s.inkSubtle} />
                          </Pressable>
                        </View>
                      </View>
                    </SoftCard>
                  );
                })}
              </View>
            )}

            {/* 4. Jadwal Shalat & Azan Widget */}
            <PrayerTimesWidget schedule={prayerSchedule} />

            {/* 5. Section: Agenda & Jadwal Hari Ini */}
            <SectionTitle
              title="Agenda Hari Ini"
              hint={totalAgendaCount > 0 ? `${completedAgendaCount}/${totalAgendaCount}` : undefined}
              actionLabel="Jadwalkan"
              onAction={() => router.push('/agenda/new')}
            />

            {totalAgendaCount === 0 ? (
              <SoftCard tone="cream" style={styles.emptyAgendaCard}>
                <View style={styles.emptyAgendaRow}>
                  <IconTile icon={CalendarDays} tone="leaf" size={42} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText style={styles.emptyAgendaTitle}>
                      Belum ada agenda terjadwal
                    </AppText>
                    <AppText style={styles.emptyAgendaSub}>
                      Ketuk Jadwalkan untuk menambah kegiatan hari ini.
                    </AppText>
                  </View>
                </View>
              </SoftCard>
            ) : (
              <View style={styles.cardStack}>
                {events.map((ev) => {
                  const startTime = ev.isAllDay
                    ? 'Sepanjang hari'
                    : new Date(ev.startTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                  const isDone = ev.isCompleted;

                  return (
                    <SoftCard key={ev.id} style={styles.taskCard}>
                      <View style={styles.taskCardRow}>
                        <SproutCheck
                          checked={isDone}
                          onPress={() => toggleEvent(ev.id, isDone)}
                          accessibilityLabel={(isDone ? 'Buka kembali ' : 'Selesaikan ') + ev.title}
                          size={28}
                        />
                        <View style={styles.taskCenterCol}>
                          <AppText
                            style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                            numberOfLines={1}
                          >
                            {ev.title}
                          </AppText>
                          <AppText style={styles.taskSubtext}>
                            {startTime} · Agenda Harian
                          </AppText>
                        </View>
                        <IconTile icon={CalendarDays} tone="leaf" size={42} />
                      </View>
                    </SoftCard>
                  );
                })}

                {activeOccurrences.map((occ) => {
                  const isDone = occ.isCompleted;

                  return (
                    <SoftCard key={occ.schedule.id} style={styles.taskCard}>
                      <View style={styles.taskCardRow}>
                        <SproutCheck
                          checked={isDone}
                          onPress={() => toggleWeeklyOccurrence(occ.schedule.id, isDone)}
                          accessibilityLabel={
                            (isDone ? 'Buka kembali ' : 'Selesaikan ') + occ.schedule.title
                          }
                          size={28}
                        />
                        <View style={styles.taskCenterCol}>
                          <AppText
                            style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                            numberOfLines={1}
                          >
                            {occ.schedule.title}
                          </AppText>
                          <AppText style={styles.taskSubtext}>
                            {occ.schedule.startTime} – {occ.schedule.endTime} · Jadwal Rutin
                          </AppText>
                        </View>
                        <IconTile icon={Repeat} tone="teal" size={42} />
                      </View>
                    </SoftCard>
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
    marginTop: 52,
    marginBottom: space[1],
    position: 'relative',
  },
  sproutLeftBadge: {
    position: 'absolute',
    top: -22,
    left: 18,
    zIndex: 3,
  },
  mascotPeekWrap: {
    position: 'absolute',
    top: -66,
    right: 8,
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
  cardStack: {
    gap: space[3],
  },
  taskCard: {
    borderRadius: 28,
    paddingVertical: space[4],
    paddingHorizontal: space[4],
  },
  taskCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  taskCenterCol: {
    flex: 1,
    gap: 3,
  },
  taskTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 21,
    color: s.ink,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  taskTitleCancelled: {
    textDecorationLine: 'line-through',
    color: s.inkSubtle,
  },
  taskSubtext: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  taskRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  removeMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAgendaCard: {
    borderRadius: 24,
  },
  emptyAgendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  emptyAgendaTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  emptyAgendaSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: s.inkMuted,
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
