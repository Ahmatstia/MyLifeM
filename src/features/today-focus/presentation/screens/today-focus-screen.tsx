import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  Check,
  Play,
  Pause,
  ChevronRight,
  Sparkles,
  Zap,
  Settings as SettingsIcon,
  X,
  Plus,
  CheckCircle2,
  Clock,
  Timer,
  CalendarDays,
} from 'lucide-react-native';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
import { formatLocalDate } from '@/shared/utils/local-date';
import { CapsuleDateStrip } from '@/shared/ui/capsule-date-strip';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useNextSchedule } from '@/features/agenda/presentation/hooks/use-next-schedule';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { AddPriorityModal } from '../components/add-priority-modal';
import { SessionReflectionModal } from '../components/session-reflection-modal';

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
    todayDate,
  } = useTodayFocus();

  const [isTimerExpanded, setIsTimerExpanded] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  useEffect(() => setSelectedDate(todayDate), [todayDate]);
  const { nextSchedule } = useNextSchedule();
  useOpenAddFromParam(() => setIsAddModalVisible(true));
  const timer = useFocusTimer({ onSessionRecorded: refresh });

  const completedCount = focusItems.filter((item) => item.isCompleted).length;
  const activeItems = focusItems.filter((item) => item.task.status !== 'CANCELLED');
  const remainingCount = Math.max(0, activeItems.length - completedCount);
  const nextTask = activeItems.find((item) => !item.isCompleted)?.task;

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Circular compass gauge calculation
  const compassSize = 58;
  const strokeW = 4.5;
  const compRadius = (compassSize - strokeW) / 2;
  const compCircumference = 2 * Math.PI * compRadius;
  const progressRatio = activeItems.length > 0 ? completedCount / activeItems.length : 0;
  const compOffset = compCircumference * (1 - progressRatio);

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenBg}>
      {/* 1. Header: Modern Minimalist Typography */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <AppText variant="labelSmall" style={styles.dateEyebrow}>
            {todayFormatted}
          </AppText>
          <AppText variant="headlineMedium" style={styles.pageTitle}>
            Hari Ini
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Buka Pengaturan"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.settingsBtnPressed]}
        >
          <SettingsIcon size={19} color="#27272A" strokeWidth={2} />
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
          <ActivityIndicator size="small" color="#E8A838" />
          <AppText color="onSurfaceVariant">Menyiapkan harimu…</AppText>
        </View>
      ) : (
        !error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 2. Sleek 7-Day Calendar Strip */}
            <View style={styles.dateStripWrapper}>
              <CapsuleDateStrip
                selectedDate={selectedDate}
                todayDate={todayDate}
                onSelectDate={(date) => {
                  if (date === todayDate) setSelectedDate(date);
                  else router.push({ pathname: '/agenda', params: { date } });
                }}
              />
            </View>

            {/* 3. Focus Timer: Expanded Widget or Fluid Daily Focus Hub */}
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
              <>
                {/* 3A. Modern Fluid Focus Dashboard (Open Canvas Layout) */}
                <View style={styles.focusDashboardHub}>
                  {/* Status Indicator Bar */}
                  <View style={styles.heroStatusRow}>
                    <View style={styles.readyPill}>
                      <View
                        style={[
                          styles.pulseDot,
                          timer.isRunning && styles.pulseDotRunning,
                          timer.hasSession && !timer.isRunning && styles.pulseDotPaused,
                        ]}
                      />
                      <AppText variant="labelSmall" style={styles.readyPillText}>
                        {timer.reflection
                          ? 'SESI TERCATAT'
                          : timer.isRunning
                            ? 'SESI BERJALAN'
                            : timer.hasSession
                              ? 'SESI SEDANG DIJEDA'
                              : `${remainingCount} Tugas Siap`}
                      </AppText>
                    </View>

                    <View style={styles.taskDoneBadge}>
                      <CheckCircle2 size={13} color="#16A34A" strokeWidth={2.4} />
                      <AppText variant="labelSmall" style={styles.taskDoneBadgeText}>
                        {completedCount}/{activeItems.length} selesai
                      </AppText>
                    </View>
                  </View>

                  {/* Headline & Progress Ring */}
                  <View style={styles.heroMiddleRow}>
                    <View style={styles.heroTextCol}>
                      <AppText variant="headlineSmall" style={styles.heroHeading}>
                        Hari Ini:
                      </AppText>
                      <AppText variant="headlineLarge" style={styles.heroMissionsCount}>
                        {remainingCount > 0
                          ? `${remainingCount} Tugas Prioritas`
                          : 'Semua Tugas Selesai!'}
                      </AppText>
                      <AppText variant="bodySmall" style={styles.heroSubtitle}>
                        Fokuskan energimu pada penyelesaian prioritas utama.
                      </AppText>
                    </View>

                    {/* Circular Progress Gauge */}
                    <View style={styles.compassContainer}>
                      <Svg width={compassSize} height={compassSize} style={styles.compassSvg}>
                        <Circle
                          cx={compassSize / 2}
                          cy={compassSize / 2}
                          r={compRadius}
                          stroke="#E4E4E7"
                          strokeWidth={strokeW}
                          fill="none"
                        />
                        <Circle
                          cx={compassSize / 2}
                          cy={compassSize / 2}
                          r={compRadius}
                          stroke="#E8A838"
                          strokeWidth={strokeW}
                          strokeDasharray={`${compCircumference} ${compCircumference}`}
                          strokeDashoffset={compOffset}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </Svg>
                      <View style={styles.compassInnerLabel}>
                        <AppText variant="titleMedium" tabularNums style={styles.compassBigNum}>
                          {completedCount}
                        </AppText>
                        <AppText variant="labelSmall" style={styles.compassSubNum}>
                          /{activeItems.length}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Tactile Quick Action Dock */}
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
                    style={({ pressed }) => [
                      styles.hubActionDock,
                      pressed && styles.hubActionDockPressed,
                    ]}
                  >
                    <View style={styles.hubActionLeft}>
                      <View style={styles.hubActionIconBox}>
                        <Play size={15} color="#D97706" fill="#D97706" />
                      </View>
                      <View style={styles.hubActionTexts}>
                        <AppText variant="labelMedium" style={styles.hubActionTitle} numberOfLines={1}>
                          {timer.activeTask?.title || nextTask?.title || 'Mulai Fokus'}
                        </AppText>
                        <AppText variant="bodySmall" style={styles.hubActionSub}>
                          {timer.hasSession ? 'Sesi sedang berjalan' : 'Klik untuk masuk zona fokus'}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.quickPlayActionPill}>
                      <Timer size={13} color="#27272A" />
                      <AppText variant="labelMedium" style={styles.quickPlayActionText}>
                        {timer.hasSession ? 'Lihat sesi fokus' : 'Mulai'}
                      </AppText>
                    </View>
                  </Pressable>

                  {/* Hub Footer: Productivity Metrics */}
                  <View style={styles.hubFooterRow}>
                    <View style={styles.vitalityTextGroup}>
                      <Clock size={13} color="#EA580C" strokeWidth={2.4} />
                      <AppText variant="bodySmall" style={styles.vitalityText}>
                        Waktu fokus: <AppText variant="labelMedium" style={styles.vitalityBold}>{completedMinutes} menit</AppText>
                      </AppText>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* 4. Agenda Terdekat: Clean Horizontal Glance Ticker */}
            {nextSchedule && (
              <Pressable
                onPress={() => router.push('/agenda' as any)}
                style={({ pressed }) => [
                  styles.agendaGlanceStrip,
                  pressed && styles.agendaGlanceStripPressed,
                ]}
              >
                <View style={styles.agendaGlanceLeft}>
                  <View style={styles.agendaGlanceIconBox}>
                    <CalendarDays size={15} color="#D97706" strokeWidth={2.2} />
                  </View>
                  <View style={styles.agendaGlanceTexts}>
                    <View style={styles.agendaGlanceTagRow}>
                      <AppText variant="labelSmall" style={styles.agendaGlanceTagText}>
                        AGENDA BERIKUTNYA
                      </AppText>
                      <AppText variant="labelSmall" style={styles.agendaGlanceTime} tabularNums>
                        · {nextSchedule.schedule.startTime} – {nextSchedule.schedule.endTime} WIB
                      </AppText>
                    </View>
                    <AppText variant="titleSmall" style={styles.agendaGlanceTitle} numberOfLines={1}>
                      {nextSchedule.schedule.title}
                    </AppText>
                  </View>
                </View>

                <ChevronRight size={16} color="#A1A1AA" strokeWidth={2.2} />
              </Pressable>
            )}

            {/* 5. Daftar Tugas Prioritas Hari Ini: Open Flow Checklist */}
            <View style={styles.questSectionHeader}>
              <View style={styles.questTitleRow}>
                <AppText variant="titleMedium" style={styles.questHeadingBold}>
                  Tugas Prioritas Hari Ini
                </AppText>
                <AppText variant="bodySmall" style={styles.maxItemsLabel}>
                  (maks. 5 tugas)
                </AppText>
              </View>

              <Pressable
                onPress={() => setIsAddModalVisible(true)}
                disabled={focusItems.length >= 5}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={({ pressed }) => [
                  styles.addPillButton,
                  pressed && styles.addPillButtonPressed,
                  focusItems.length >= 5 && styles.addPillButtonDisabled,
                ]}
              >
                <Plus size={13} color="#27272A" strokeWidth={2.5} />
                <AppText variant="labelSmall" style={styles.addPillText}>
                  Tambah
                </AppText>
              </Pressable>
            </View>

            {focusItems.length === 0 ? (
              <EmptyState
                title="Mulai dari satu langkah"
                description="Pilih tugas penting dari roadmap atau buat tugas kilat baru."
                actionTitle="Pilih prioritas"
                customIcon={<Sparkles size={28} color="#E8A838" strokeWidth={2.2} />}
                onActionPress={() => setIsAddModalVisible(true)}
              />
            ) : (
              <View style={styles.tasksChecklistWrapper}>
                {focusItems.map((item, index) => {
                  const isCompleted = item.isCompleted;
                  const isCancelled = item.task.status === 'CANCELLED';
                  const isActive = timer.activeTask?.id === item.taskId;
                  const isLast = index === focusItems.length - 1;

                  const priorityBadge =
                    item.task.priority === 'HIGH'
                      ? { label: 'Tinggi', color: '#DC2626', bg: '#FEE2E2' }
                      : item.task.priority === 'LOW'
                        ? { label: 'Rendah', color: '#4B5563', bg: '#F3F4F6' }
                        : { label: 'Prioritas', color: '#D97706', bg: '#FEF3C7' };

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.taskRow,
                        isActive && styles.taskRowActive,
                        isCompleted && styles.taskRowCompleted,
                        !isLast && styles.taskRowDivider,
                      ]}
                    >
                      {/* Left: Tactile Checkbox Button */}
                      <Pressable
                        onPress={() => toggleTask(item.taskId, isCompleted || isCancelled)}
                        accessibilityRole="checkbox"
                        aria-checked={isCompleted}
                        accessibilityState={{ checked: isCompleted }}
                        accessibilityLabel={
                          (isCompleted || isCancelled ? 'Buka kembali ' : 'Selesaikan ') +
                          item.task.title
                        }
                        style={styles.taskCheckboxBtn}
                      >
                        <View
                          style={[
                            styles.taskCheckboxBox,
                            isCompleted && styles.taskCheckboxBoxDone,
                          ]}
                        >
                          {isCompleted && (
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          )}
                        </View>
                      </Pressable>

                      {/* Center: Task Information */}
                      <View style={styles.questDetailsCol}>
                        <View style={styles.questMetaRow}>
                          <View style={[styles.tokenTag, { backgroundColor: priorityBadge.bg }]}>
                            <AppText variant="labelSmall" style={[styles.tokenText, { color: priorityBadge.color }]}>
                              {priorityBadge.label}
                            </AppText>
                          </View>
                          <View style={styles.durationTag}>
                            <Clock size={11} color="#71717A" />
                            <AppText variant="bodySmall" style={styles.questDuration}>
                              {item.task.estimatedMinutes}m
                            </AppText>
                          </View>
                        </View>

                        <AppText
                          variant="titleSmall"
                          style={[
                            styles.questTitle,
                            isCompleted && styles.questTitleDone,
                            isCancelled && styles.questTitleCancelled,
                          ]}
                          numberOfLines={1}
                        >
                          {item.task.title}
                        </AppText>

                        <AppText
                          variant="bodySmall"
                          style={[
                            styles.questSubtext,
                            isCompleted && styles.questSubtextDone,
                            isCancelled && styles.questSubtextCancelled,
                          ]}
                          numberOfLines={1}
                        >
                          {isCancelled
                            ? 'Dibatalkan'
                            : isCompleted
                              ? 'Selesai'
                              : isActive
                                ? 'Sedang fokus'
                                : item.task.description || 'Tugas harian'}
                        </AppText>
                      </View>

                      {/* Right: Quick Action Controls */}
                      <View style={styles.questActionGroup}>
                        <Pressable
                          onPress={() => removeFromToday(item.id)}
                          accessibilityRole="button"
                          accessibilityLabel={'Hapus ' + item.task.title}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.questRemoveBtn}
                        >
                          <X size={15} color="#A1A1AA" />
                        </Pressable>

                        {isCompleted ? null : isCancelled ? null : isActive ? (
                          <Pressable
                            onPress={timer.pauseTimer}
                            accessibilityRole="button"
                            accessibilityLabel={'Jeda fokus ' + item.task.title}
                            style={styles.questPlayBtnActive}
                          >
                            <Pause size={13} color="#FFFFFF" />
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => {
                              if (!timer.hasSession) timer.setActiveTask(item.task);
                              setIsTimerExpanded(true);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={'Mulai fokus ' + item.task.title}
                            style={styles.questPlayBtn}
                          >
                            <Play size={12} color="#27272A" fill="#27272A" />
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 6. Editorial Principle Insight */}
            <View style={styles.editorialCallout}>
              <View style={styles.editorialContent}>
                <View style={styles.editorialHeader}>
                  <Zap size={14} color="#EA580C" strokeWidth={2.4} />
                  <AppText variant="labelMedium" style={styles.editorialTitle}>
                    Prinsip Fokus & Produktivitas
                  </AppText>
                </View>
                <AppText variant="bodySmall" style={styles.editorialBody}>
                  Selesaikan 1–2 tugas prioritas utama di awal hari saat energi konsentrasi berada di puncak optimal.
                </AppText>
              </View>
            </View>

            {/* Bottom spacer for floating button */}
            <View style={{ height: space[16] }} />
          </ScrollView>
        )
      )}

      {/* Floating Add New Priority Task Bar */}
      <View style={styles.floatingBottomContainer} pointerEvents="box-none">
        <Pressable
          onPress={() => setIsAddModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah Tugas Prioritas"
          style={({ pressed }) => [
            styles.floatingAddQuestBtn,
            pressed && styles.floatingBtnPressed,
          ]}
        >
          <Plus size={17} color="#FFFFFF" strokeWidth={2.8} />
          <AppText variant="titleMedium" style={styles.floatingAddQuestText}>
            Tambah Tugas Prioritas
          </AppText>
        </Pressable>
      </View>

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
    backgroundColor: '#FAFAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[3],
    paddingBottom: space[2],
  },
  headerTextCol: {
    gap: 1,
  },
  dateEyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: '#71717A',
    textTransform: 'capitalize',
  },
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#18181B',
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnPressed: {
    backgroundColor: '#E4E4E7',
    transform: [{ scale: 0.96 }],
  },
  dateStripWrapper: {
    marginBottom: space[1],
  },
  scrollContent: {
    paddingBottom: 110,
    gap: space[3],
  },
  notice: {
    marginBottom: space[2],
  },
  loading: {
    paddingVertical: space[10],
    alignItems: 'center',
    gap: space[3],
  },
  // 3A. Modern Fluid Focus Hub (No chunky cartoon borders!)
  focusDashboardHub: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    padding: 16,
    marginBottom: space[2],
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8A838',
  },
  pulseDotRunning: {
    backgroundColor: '#16A34A',
  },
  pulseDotPaused: {
    backgroundColor: '#EA580C',
  },
  readyPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#3F3F46',
  },
  taskDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  taskDoneBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#166534',
  },
  heroMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    marginVertical: space[1],
  },
  heroTextCol: {
    flex: 1,
  },
  heroHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#71717A',
    lineHeight: 18,
  },
  heroMissionsCount: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: '#18181B',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#71717A',
    lineHeight: 17,
  },
  compassContainer: {
    position: 'relative',
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  compassInnerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBigNum: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 17,
    color: '#18181B',
  },
  compassSubNum: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    color: '#71717A',
  },
  hubActionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: space[3],
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  hubActionDockPressed: {
    backgroundColor: '#F5F2EC',
  },
  hubActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hubActionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubActionTexts: {
    flex: 1,
    gap: 1,
  },
  hubActionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#18181B',
  },
  hubActionSub: {
    fontSize: 11,
    color: '#71717A',
  },
  quickPlayActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  quickPlayActionText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#18181B',
  },
  hubFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[2],
    marginTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  vitalityTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vitalityText: {
    fontSize: 12,
    color: '#71717A',
  },
  vitalityBold: {
    fontFamily: fontFamily.bold,
    color: '#18181B',
    fontSize: 12,
  },
  agendaGlanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: space[2],
  },
  agendaGlanceStripPressed: {
    backgroundColor: '#FEF3C7',
  },
  agendaGlanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  agendaGlanceIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaGlanceTexts: {
    flex: 1,
    gap: 1,
  },
  agendaGlanceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agendaGlanceTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#B45309',
    letterSpacing: 0.5,
  },
  agendaGlanceTime: {
    fontSize: 11,
    color: '#78716C',
  },
  agendaGlanceTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#18181B',
  },
  questSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[2],
    marginBottom: space[1],
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  questHeadingBold: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: '#18181B',
  },
  maxItemsLabel: {
    fontSize: 12,
    color: '#71717A',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  addPillButtonPressed: {
    backgroundColor: '#E4E4E7',
  },
  addPillButtonDisabled: {
    opacity: 0.4,
  },
  addPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#18181B',
  },
  // Checklist without enclosing card box!
  tasksChecklistWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 12,
    marginBottom: space[2],
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  taskRowActive: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  taskRowCompleted: {
    opacity: 0.7,
  },
  taskRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  taskCheckboxBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxBoxDone: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  questDetailsCol: {
    flex: 1,
    gap: 2,
  },
  questMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  tokenTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tokenText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  questDuration: {
    fontSize: 11,
    color: '#71717A',
    fontFamily: fontFamily.medium,
  },
  questTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 19,
    color: '#18181B',
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: '#A1A1AA',
  },
  questTitleCancelled: {
    textDecorationLine: 'line-through',
    color: '#DC2626',
  },
  questSubtext: {
    fontSize: 12,
    lineHeight: 16,
    color: '#71717A',
  },
  questSubtextDone: {
    color: '#16A34A',
    fontFamily: fontFamily.bold,
  },
  questSubtextCancelled: {
    color: '#DC2626',
    fontFamily: fontFamily.bold,
  },
  questActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questPlayBtnActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorialCallout: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
    padding: 12,
    marginBottom: space[4],
  },
  editorialContent: {
    gap: 2,
  },
  editorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editorialTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#18181B',
  },
  editorialBody: {
    fontSize: 12,
    color: '#71717A',
    lineHeight: 17,
  },
  floatingBottomContainer: {
    position: 'absolute',
    bottom: space[3],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingAddQuestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1E2E',
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: space[6],
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  floatingBtnPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#2E2E3E',
  },
  floatingAddQuestText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
