import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  Bell,
  ArrowRight,
  Check,
  Play,
  Pause,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  CircleUserRound,
  X,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
import { formatLocalDate } from '@/shared/utils/local-date';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useNextSchedule } from '@/features/agenda/presentation/hooks/use-next-schedule';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { AddPriorityModal } from '../components/add-priority-modal';
import { SessionReflectionModal } from '../components/session-reflection-modal';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

  const [isTimerExpanded, setIsTimerExpanded] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const { nextSchedule } = useNextSchedule();
  useOpenAddFromParam(() => setIsAddModalVisible(true));
  const timer = useFocusTimer({ onSessionRecorded: refresh });

  const completedCount = focusItems.filter((item) => item.isCompleted).length;
  const activeItems = focusItems.filter((item) => item.task.status !== 'CANCELLED');
  const nextTask = activeItems.find((item) => !item.isCompleted)?.task;
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Calculate 7-day strip (2 days before, today, 4 days after)
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    const dateStr = formatLocalDate(d);
    return {
      dateStr,
      dayName: DAY_NAMES[d.getDay()],
      dayNumber: d.getDate(),
      isSelected: dateStr === selectedDate,
      isToday: dateStr === formatLocalDate(today),
    };
  });

  return (
    <Screen style={styles.screenBg}>
      {/* TOP HEADER (Exact Stitch: Avatar with Citron Dot + "Halo, Sandra ✨" + Bell Icon) */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <CircleUserRound size={24} color={colors.bento.stitchObsidian} strokeWidth={2.4} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.greetingContainer}>
            <AppText variant="titleMedium" style={styles.greetingText}>
              Halo, Sandra ✨
            </AppText>
            <AppText variant="bodySmall" style={styles.dateSubtext}>
              {todayFormatted}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Buka Pengaturan"
          style={styles.notificationBtn}
        >
          <Bell size={20} color={colors.bento.stitchObsidian} strokeWidth={2.2} />
        </Pressable>
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
          <ActivityIndicator size="large" color={colors.bento.stitchLavenderDark} />
          <AppText color="onSurfaceVariant">Menyiapkan harimu…</AppText>
        </View>
      ) : (
        !error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* WEEKLY CALENDAR PILL STRIP (Exact Stitch: Min 1, Sen 2, Sel 3, Rab 4 ★ active obsidian, etc.) */}
            <View style={styles.weeklyStrip}>
              {weekDays.map((item) => {
                const isSelected = item.isSelected;
                return (
                  <Pressable
                    key={item.dateStr}
                    onPress={() => {
                      setSelectedDate(item.dateStr);
                      if (item.dateStr !== formatLocalDate(new Date())) {
                        router.push('/agenda' as any);
                      }
                    }}
                    style={[
                      styles.dayCapsule,
                      isSelected ? styles.dayCapsuleActive : styles.dayCapsuleInactive,
                    ]}
                  >
                    {isSelected && (
                      <Star
                        size={10}
                        fill={colors.bento.stitchCitron}
                        color={colors.bento.stitchCitron}
                        style={styles.capsuleStar}
                      />
                    )}
                    <AppText
                      variant="labelSmall"
                      style={[
                        styles.dayLabel,
                        isSelected ? styles.dayLabelActive : styles.dayLabelInactive,
                      ]}
                    >
                      {item.dayName}
                    </AppText>
                    <AppText
                      variant="titleMedium"
                      tabularNums
                      style={[
                        styles.dayNumber,
                        isSelected ? styles.dayNumberActive : styles.dayNumberInactive,
                      ]}
                    >
                      {item.dayNumber}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* HERO FOCUS CARD (Exact Stitch: bg-lavender #A5A6F6 with 3D starburst/flower SVG) */}
            {isTimerExpanded ? (
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
            ) : (
              <View style={styles.heroCard}>
                {/* 3D Flower / Starburst SVG Accent (Citron flower with Orange center) */}
                <View style={styles.flowerContainer} pointerEvents="none">
                  <Svg width={120} height={120} viewBox="0 0 200 200">
                    <Path
                      d="M100 0C106 50 150 94 200 100C150 106 106 150 100 200C94 150 50 106 0 100C50 94 94 50 100 0Z"
                      fill={colors.bento.stitchCitron}
                    />
                    <Circle cx="100" cy="100" r="32" fill={colors.bento.stitchTangerine} />
                  </Svg>
                </View>

                {/* Status indicator: Sesi Berjalan / Fokus Hari Ini */}
                <View style={styles.heroStatusRow}>
                  <View style={styles.statusPulseDot} />
                  <AppText variant="labelSmall" style={styles.heroStatusText}>
                    {timer.reflection
                      ? 'SESI TERCATAT'
                      : timer.isRunning
                        ? 'SESI BERJALAN'
                        : timer.hasSession
                          ? 'SESI SEDANG DIJEDA'
                          : 'FOKUS HARI INI'}
                  </AppText>
                </View>

                {/* Hero Title & Active Task */}
                <AppText variant="headlineLarge" style={styles.heroTitle}>
                  Satu langkah lebih dekat.
                </AppText>
                <AppText variant="bodySmall" style={styles.heroTaskTitle}>
                  {timer.activeTask?.title ||
                    nextTask?.title ||
                    'Mulai dari satu hal kecil yang ingin kamu selesaikan.'}
                </AppText>

                {/* Bottom Row: Countdown Timer & Pill CTA */}
                <View style={styles.heroBottomRow}>
                  <View>
                    <AppText variant="labelSmall" style={styles.timerSublabel}>
                      {timer.hasSession ? 'SISA WAKTU' : 'TARGET DURASI'}
                    </AppText>
                    <AppText variant="headlineLarge" tabularNums style={styles.timerDigits}>
                      {timer.hasSession ? timer.formattedTime : '25:00'}
                    </AppText>
                  </View>

                  <Pressable
                    onPress={() => {
                      if (!nextTask && !timer.activeTask && !timer.hasSession) {
                        setIsAddModalVisible(true);
                      } else {
                        if (!timer.hasSession && !timer.activeTask && nextTask) {
                          timer.setActiveTask(nextTask);
                        }
                        setIsTimerExpanded(true);
                      }
                    }}
                    style={styles.heroPillBtn}
                  >
                    <AppText variant="labelMedium" style={styles.heroPillBtnText}>
                      {timer.hasSession ? 'Lihat sesi fokus' : 'Buka Timer'}
                    </AppText>
                    <View style={styles.heroArrowCircle}>
                      <ArrowRight size={14} color={colors.bento.stitchObsidian} strokeWidth={2.8} />
                    </View>
                  </Pressable>
                </View>
              </View>
            )}

            {/* DUAL FEATURE METRICS (Exact Stitch: Tangerine Card + White Card) */}
            <View style={styles.metricsGrid}>
              {/* Tangerine Card: Prioritas Selesai */}
              <View style={styles.tangerineMetricCard}>
                <View style={styles.metricIconBoxTangerine}>
                  <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <AppText variant="labelSmall" style={styles.metricLabelWhite}>
                  PRIORITAS SELESAI
                </AppText>
                <View style={styles.metricNumberRow}>
                  <AppText variant="headlineLarge" tabularNums style={styles.metricBigNumberWhite}>
                    {completedCount}
                  </AppText>
                  <AppText variant="titleMedium" style={styles.metricSubNumberWhite}>
                    / {activeItems.length}
                  </AppText>
                </View>
                <View style={styles.metricFooterTangerine}>
                  <AppText variant="labelSmall" style={styles.metricFooterWhiteText}>
                    {activeItems.length > 0
                      ? `${Math.round((completedCount / activeItems.length) * 100)}% Tercapai`
                      : 'Siap mulai'}
                  </AppText>
                  <AppText variant="bodySmall">🎯</AppText>
                </View>
              </View>

              {/* White Card: Waktu Fokus */}
              <View style={styles.whiteMetricCard}>
                <View style={styles.metricIconBoxCitron}>
                  <Clock size={16} color={colors.bento.stitchObsidian} strokeWidth={2.5} />
                </View>
                <AppText variant="labelSmall" style={styles.metricLabelMuted}>
                  WAKTU FOKUS
                </AppText>
                <View style={styles.metricNumberRow}>
                  <AppText variant="headlineLarge" tabularNums style={styles.metricBigNumberDark}>
                    {completedMinutes}
                  </AppText>
                  <AppText variant="titleSmall" style={styles.metricUnitDark}>
                    mnt
                  </AppText>
                </View>
                <View style={styles.metricFooterWhite}>
                  <AppText variant="labelSmall" style={styles.metricFooterSuccessText}>
                    Sesi hari ini
                  </AppText>
                  <AppText variant="bodySmall">⚡</AppText>
                </View>
              </View>
            </View>

            {/* CARD AGENDA BERIKUTNYA (Exact Stitch: bg-forest #13352C with Citron Tag) */}
            {nextSchedule && (
              <Pressable
                onPress={() => router.push('/agenda' as any)}
                style={styles.agendaCard}
              >
                <View style={styles.agendaCardLeft}>
                  <AppText variant="labelSmall" style={styles.agendaTagCitron}>
                    AGENDA BERIKUTNYA
                  </AppText>
                  <AppText variant="titleMedium" style={styles.agendaTitle} numberOfLines={1}>
                    {nextSchedule.schedule.title}
                  </AppText>
                  <AppText variant="bodySmall" style={styles.agendaTimeSubtitle} tabularNums>
                    {nextSchedule.schedule.startTime} – {nextSchedule.schedule.endTime} WIB
                    {nextSchedule.schedule.location ? ` • ${nextSchedule.schedule.location}` : ''}
                  </AppText>
                </View>

                <View style={styles.agendaChevronBox}>
                  <ChevronRight size={18} color={colors.bento.stitchCitron} strokeWidth={2.5} />
                </View>
              </Pressable>
            )}

            {/* PRIORITAS HARI INI (Exact Stitch: Checklist dengan Tag Done / Active State) */}
            <View style={styles.prioritySectionHeader}>
              <View style={styles.priorityTitleRow}>
                <AppText variant="titleMedium" style={styles.sectionHeadingBold}>
                  Yang penting hari ini
                </AppText>
                <AppText variant="bodySmall" style={styles.maxItemsLabel}>
                  (maks. 5)
                </AppText>
              </View>

              <Pressable
                onPress={() => setIsAddModalVisible(true)}
                disabled={focusItems.length >= 5}
                style={styles.addPillButton}
              >
                <AppText variant="labelSmall" style={styles.addPillText}>
                  + Tambah
                </AppText>
              </Pressable>
            </View>

            {focusItems.length === 0 ? (
              <EmptyState
                title="Mulai dari satu langkah"
                description="Pilih tugas penting dari roadmap atau buat tugas kilat baru."
                actionTitle="Pilih prioritas"
                customIcon={<Sparkles size={36} color={colors.bento.stitchLavenderDark} strokeWidth={2.4} />}
                onActionPress={() => setIsAddModalVisible(true)}
              />
            ) : (
              focusItems.map((item) => {
                const isCompleted = item.isCompleted;
                const isCancelled = item.task.status === 'CANCELLED';
                const isActive = timer.activeTask?.id === item.taskId;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.taskCard,
                      isActive && styles.taskCardActive,
                      isCompleted && styles.taskCardCompleted,
                    ]}
                  >
                    <View style={styles.taskCardLeft}>
                      {/* Checkbox: Green fill when completed */}
                      <Pressable
                        onPress={() => toggleTask(item.taskId, isCompleted || isCancelled)}
                        accessibilityRole="checkbox"
                        aria-checked={isCompleted}
                        accessibilityState={{ checked: isCompleted }}
                        accessibilityLabel={(isCompleted || isCancelled ? 'Buka kembali ' : 'Selesaikan ') + item.task.title}
                        style={[
                          styles.stitchCheckbox,
                          isCompleted && styles.stitchCheckboxDone,
                        ]}
                      >
                        {isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </Pressable>

                      <View style={styles.taskTextContainer}>
                        <AppText
                          variant="titleSmall"
                          style={[
                            styles.taskTitleText,
                            isCompleted && styles.taskTitleCompleted,
                            isCancelled && styles.taskTitleCancelled,
                          ]}
                        >
                          {item.task.title}
                        </AppText>
                        <AppText
                          variant="labelSmall"
                          style={[
                            styles.taskSubtext,
                            isActive && styles.taskSubtextActive,
                            isCompleted && styles.taskSubtextDone,
                          ]}
                        >
                          {isCancelled
                            ? 'Dibatalkan'
                            : isCompleted
                              ? 'Selesai'
                              : isActive
                                ? 'Sedang fokus'
                                : `${item.task.estimatedMinutes} menit`}
                        </AppText>
                      </View>
                    </View>

                    {/* Right action button */}
                    <View style={styles.taskCardRight}>
                      <Pressable
                        onPress={() => removeFromToday(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={'Hapus ' + item.task.title}
                        style={styles.taskRemoveBtn}
                      >
                        <X size={14} color="rgba(21, 23, 24, 0.4)" strokeWidth={2.2} />
                      </Pressable>

                      {isCompleted ? (
                        <AppText variant="labelSmall" style={styles.doneBadgeText}>
                          DONE
                        </AppText>
                      ) : isCancelled ? null : isActive ? (
                        <Pressable
                          onPress={timer.pauseTimer}
                          accessibilityRole="button"
                          accessibilityLabel={'Jeda fokus ' + item.task.title}
                          style={styles.taskActionActiveBtn}
                        >
                          <Pause size={14} color={colors.bento.stitchLavenderDark} />
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => {
                            if (!timer.hasSession) timer.setActiveTask(item.task);
                            setIsTimerExpanded(true);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={'Mulai fokus ' + item.task.title}
                          style={styles.taskActionNormalBtn}
                        >
                          <Play size={13} color={colors.bento.stitchObsidian} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {/* MINDFUL QUOTE FOOTER (Exact Stitch: bg-[#EFECE3] with 🌱) */}
            <View style={styles.mindfulQuoteBox}>
              <AppText variant="titleMedium" style={styles.seedlingIcon}>
                🌱
              </AppText>
              <AppText variant="bodySmall" style={styles.mindfulQuoteText}>
                &quot;Rencana boleh disesuaikan. Fokus pada langkah yang masuk akal untukmu hari ini.&quot;
              </AppText>
            </View>
          </ScrollView>
        )
      )}

      {/* MODALS */}
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: '#F6F4EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1E5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DCF763',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingContainer: {
    gap: 1,
  },
  greetingText: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: '#151718',
  },
  dateSubtext: {
    fontSize: 12,
    color: 'rgba(21, 23, 24, 0.5)',
    fontFamily: fontFamily.medium,
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(21, 23, 24, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 110,
    gap: space[3],
  },
  notice: {
    marginBottom: space[3],
  },
  loading: {
    paddingVertical: space[10],
    alignItems: 'center',
    gap: space[3],
  },

  /* WEEKLY CALENDAR STRIP */
  weeklyStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    paddingVertical: 4,
  },
  dayCapsule: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  dayCapsuleInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dayCapsuleActive: {
    backgroundColor: '#151718',
    transform: [{ scale: 1.05 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  capsuleStar: {
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: fontFamily.semibold,
    textTransform: 'uppercase',
  },
  dayLabelInactive: {
    color: 'rgba(21, 23, 24, 0.45)',
  },
  dayLabelActive: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    marginTop: 2,
  },
  dayNumberInactive: {
    color: '#151718',
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },

  /* HERO FOCUS CARD */
  heroCard: {
    backgroundColor: '#A5A6F6',
    borderRadius: 32,
    padding: space[5],
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#7577EC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  flowerContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 0.95,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  heroStatusText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: 'rgba(21, 23, 24, 0.8)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: '#151718',
    maxWidth: 220,
  },
  heroTaskTitle: {
    fontSize: 12,
    color: 'rgba(21, 23, 24, 0.75)',
    fontFamily: fontFamily.medium,
    marginTop: 4,
    maxWidth: 220,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: space[4],
    paddingTop: 4,
  },
  timerSublabel: {
    fontSize: 10,
    color: 'rgba(21, 23, 24, 0.6)',
    fontFamily: fontFamily.bold,
    letterSpacing: 0.6,
  },
  timerDigits: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    color: '#151718',
    letterSpacing: -1,
  },
  heroPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151718',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroPillBtnText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  heroArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCF763',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* DUAL METRICS */
  metricsGrid: {
    flexDirection: 'row',
    gap: space[3],
  },
  tangerineMetricCard: {
    flex: 1,
    backgroundColor: '#FF9E44',
    borderRadius: 28,
    padding: space[4],
    justifyContent: 'space-between',
    shadowColor: '#FF9E44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  metricIconBoxTangerine: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  metricLabelWhite: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.6,
  },
  metricNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  metricBigNumberWhite: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  metricSubNumberWhite: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  metricFooterTangerine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: space[3],
    paddingTop: 8,
  },
  metricFooterWhiteText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
  whiteMetricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: space[4],
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIconBoxCitron: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#DCF763',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  metricLabelMuted: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: 'rgba(21, 23, 24, 0.5)',
    letterSpacing: 0.6,
  },
  metricBigNumberDark: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: '#151718',
  },
  metricUnitDark: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: 'rgba(21, 23, 24, 0.6)',
  },
  metricFooterWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: space[3],
    paddingTop: 8,
  },
  metricFooterSuccessText: {
    color: '#059669',
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },

  /* AGENDA BERIKUTNYA */
  agendaCard: {
    backgroundColor: '#13352C',
    borderRadius: 28,
    padding: space[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#13352C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  agendaCardLeft: {
    flex: 1,
    gap: 3,
    paddingRight: space[2],
  },
  agendaTagCitron: {
    color: '#DCF763',
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  agendaTitle: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  agendaTimeSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  agendaChevronBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* PRIORITAS SECTION */
  prioritySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priorityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeadingBold: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#151718',
  },
  maxItemsLabel: {
    fontSize: 12,
    color: 'rgba(21, 23, 24, 0.4)',
    fontFamily: fontFamily.semibold,
  },
  addPillButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  addPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#151718',
  },

  /* TASK CARD */
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  taskCardActive: {
    borderWidth: 2,
    borderColor: 'rgba(117, 119, 236, 0.7)',
  },
  taskCardCompleted: {
    opacity: 0.8,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stitchCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stitchCheckboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskTextContainer: {
    flex: 1,
    gap: 2,
  },
  taskTitleText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#151718',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(21, 23, 24, 0.55)',
  },
  taskTitleCancelled: {
    textDecorationLine: 'line-through',
    color: '#EF4444',
  },
  taskSubtext: {
    fontSize: 11,
    color: 'rgba(21, 23, 24, 0.5)',
    fontFamily: fontFamily.medium,
  },
  taskSubtextActive: {
    color: '#7577EC',
    fontFamily: fontFamily.bold,
  },
  taskSubtextDone: {
    color: '#10B981',
    fontFamily: fontFamily.bold,
  },
  taskCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: 'rgba(21, 23, 24, 0.3)',
    letterSpacing: 0.6,
  },
  taskActionActiveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECEBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskActionNormalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* MINDFUL FOOTER */
  mindfulQuoteBox: {
    backgroundColor: '#EFECE3',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 24,
    padding: space[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[2],
  },
  seedlingIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  mindfulQuoteText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(21, 23, 24, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 16,
  },
});
