import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import {
  Check,
  Play,
  Pause,
  ChevronRight,
  Sparkles,
  Settings as SettingsIcon,
  X,
  Plus,
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

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenBg}>
      {/* 1. Header: Clean & Direct */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <AppText variant="headlineMedium" style={styles.pageTitle}>
            Hari Ini
          </AppText>
          <AppText variant="labelSmall" style={styles.dateSubtext}>
            {todayFormatted}
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Buka Pengaturan"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.settingsBtnPressed]}
        >
          <SettingsIcon size={19} color="#121316" strokeWidth={2} />
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
          <ActivityIndicator size="small" color="#0E6852" />
          <AppText color="onSurfaceVariant">Menyiapkan harimu…</AppText>
        </View>
      ) : (
        !error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 2. Trantor Segmented Action Dock */}
            <View style={styles.segmentedActionDock}>
              {/* Left Pill: Mulai Fokus / Timer */}
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
                  styles.segmentedPillLeft,
                  pressed && styles.segmentedPressed,
                ]}
              >
                <Play size={13} color="#8A3C1B" fill="#8A3C1B" />
                <AppText variant="labelMedium" style={styles.segmentedTextPeach}>
                  {timer.hasSession ? 'Lanjut Fokus' : 'Mulai Fokus'}
                </AppText>
              </Pressable>

              {/* Center Circle: Add New Priority (+) */}
              <Pressable
                onPress={() => setIsAddModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Tambah Tugas"
                style={({ pressed }) => [
                  styles.segmentedCenterCircle,
                  pressed && styles.segmentedPressed,
                ]}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={3} />
              </Pressable>

              {/* Right Pill: Agenda Shortcut */}
              <Pressable
                onPress={() => router.push('/agenda' as any)}
                style={({ pressed }) => [
                  styles.segmentedPillRight,
                  pressed && styles.segmentedPressed,
                ]}
              >
                <AppText variant="labelMedium" style={styles.segmentedTextMint}>
                  Agenda
                </AppText>
                <CalendarDays size={13} color="#0E6852" />
              </Pressable>
            </View>

            {/* 3. Weekly 7-Day Pill Meter (#CEF5EB Pod) */}
            <View style={styles.mintMeterPod}>
              {/* Top Status & Metrics Row (Clean typography, no dots/badges) */}
              <View style={styles.mintPodTopRow}>
                <AppText
                  variant="labelSmall"
                  style={[
                    styles.statusText,
                    timer.isRunning && styles.statusRunning,
                    timer.hasSession && !timer.isRunning && styles.statusPaused,
                  ]}
                >
                  {timer.reflection
                    ? 'SESI TERCATAT'
                    : timer.isRunning
                      ? 'SESI BERJALAN'
                      : timer.hasSession
                        ? 'SESI SEDANG DIJEDA'
                        : `${remainingCount} Tugas Siap`}
                </AppText>

                <AppText variant="labelSmall" style={styles.counterText}>
                  {completedCount}/{activeItems.length} selesai
                </AppText>
              </View>

              {/* 7-Day Vertical Pill Meter Bars */}
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

              {/* Bottom Metrics Ribbon of Mint Pod */}
              <View style={styles.mintPodBottomRow}>
                <View style={styles.focusMinutesGroup}>
                  <Clock size={12} color="#0E6852" strokeWidth={2.4} />
                  <AppText variant="bodySmall" style={styles.focusMinutesText}>
                    Waktu fokus: <AppText variant="labelMedium" style={styles.focusMinutesBold}>{completedMinutes} menit</AppText>
                  </AppText>
                </View>
              </View>
            </View>

            {/* 4. Focus Timer: Expanded Widget or Tactile Quick Action Dock */}
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
                    <Play size={14} color="#CEF5EB" fill="#CEF5EB" />
                  </View>
                  <View style={styles.hubActionTexts}>
                    <AppText variant="labelMedium" style={styles.hubActionTitle} numberOfLines={1}>
                      {timer.activeTask?.title || nextTask?.title || 'Mulai Fokus'}
                    </AppText>
                    <AppText variant="bodySmall" style={styles.hubActionSub}>
                      {timer.hasSession ? 'Sesi sedang berjalan' : 'Siap fokus'}
                    </AppText>
                  </View>
                </View>

                <View style={styles.quickPlayActionPill}>
                  <Timer size={12} color="#CEF5EB" />
                  <AppText variant="labelMedium" style={styles.quickPlayActionText}>
                    {timer.hasSession ? 'Lihat sesi fokus' : 'Mulai'}
                  </AppText>
                </View>
              </Pressable>
            )}

            {/* 5. Agenda Terdekat: Trantor Obsidian Black Pod (#121316) */}
            {nextSchedule && (
              <Pressable
                onPress={() => router.push('/agenda' as any)}
                style={({ pressed }) => [
                  styles.darkAgendaPod,
                  pressed && styles.darkAgendaPodPressed,
                ]}
              >
                <View style={styles.darkAgendaLeft}>
                  <View style={styles.darkAgendaIconBox}>
                    <CalendarDays size={16} color="#0E6852" strokeWidth={2.4} />
                  </View>
                  <View style={styles.darkAgendaTexts}>
                    <AppText variant="labelSmall" style={styles.darkAgendaTime} tabularNums>
                      AGENDA BERIKUTNYA · {nextSchedule.schedule.startTime} – {nextSchedule.schedule.endTime} WIB
                    </AppText>
                    <AppText variant="titleSmall" style={styles.darkAgendaTitle} numberOfLines={1}>
                      {nextSchedule.schedule.title}
                    </AppText>
                  </View>
                </View>

                <ChevronRight size={18} color="#CEF5EB" strokeWidth={2.2} />
              </Pressable>
            )}

            {/* 6. Daftar Tugas Prioritas Hari Ini */}
            <View style={styles.questSectionHeader}>
              <AppText variant="titleMedium" style={styles.questHeadingBold}>
                Tugas Prioritas Hari Ini
              </AppText>

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
                <Plus size={13} color="#121316" strokeWidth={2.8} />
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
                customIcon={<Sparkles size={28} color="#0E6852" strokeWidth={2.2} />}
                onActionPress={() => setIsAddModalVisible(true)}
              />
            ) : (
              <View style={styles.tasksPodWrapper}>
                {focusItems.map((item, index) => {
                  const isCompleted = item.isCompleted;
                  const isCancelled = item.task.status === 'CANCELLED';
                  const isActive = timer.activeTask?.id === item.taskId;
                  const isLast = index === focusItems.length - 1;

                  // Clean typography colors without pill badges
                  const priorityLabel =
                    item.task.priority === 'HIGH'
                      ? 'Tinggi'
                      : item.task.priority === 'LOW'
                        ? 'Rendah'
                        : 'Prioritas';

                  const priorityColor =
                    item.task.priority === 'HIGH'
                      ? '#DC2626'
                      : item.task.priority === 'LOW'
                        ? '#717684'
                        : '#0E6852';

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
                      {/* Left: Tactile Circular Checkbox Pod */}
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
                            <Check size={13} color="#CEF5EB" strokeWidth={3} />
                          )}
                        </View>
                      </Pressable>

                      {/* Center: Task Information (Clean typography, no badge soup) */}
                      <View style={styles.questDetailsCol}>
                        <View style={styles.questMetaRow}>
                          <AppText variant="labelSmall" style={[styles.priorityLabel, { color: priorityColor }]}>
                            {priorityLabel}
                          </AppText>
                          <AppText variant="bodySmall" style={styles.questDuration}>
                            · {item.task.estimatedMinutes}m
                          </AppText>
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
                          <X size={15} color="#9499A8" />
                        </Pressable>

                        {isCompleted ? null : isCancelled ? null : isActive ? (
                          <Pressable
                            onPress={timer.pauseTimer}
                            accessibilityRole="button"
                            accessibilityLabel={'Jeda fokus ' + item.task.title}
                            style={styles.questPlayBtnActive}
                          >
                            <Pause size={13} color="#121316" />
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
                            <Play size={12} color="#121316" fill="#121316" />
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Bottom spacer for floating button */}
            <View style={{ height: space[16] }} />
          </ScrollView>
        )
      )}

      {/* 7. Trantor Floating Action Bar (Clean CTA, no double-badge) */}
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
          <Plus size={18} color="#FFFFFF" strokeWidth={3} />
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
    backgroundColor: '#F6F7F9', // Trantor Canvas Clean Light Grey
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
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#121316',
  },
  dateSubtext: {
    fontSize: 12,
    color: '#717684',
    fontFamily: fontFamily.medium,
    textTransform: 'capitalize',
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 19, 22, 0.08)',
    shadowColor: '#121316',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  settingsBtnPressed: {
    backgroundColor: '#ECEEF2',
    transform: [{ scale: 0.95 }],
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
  // 2. Trantor Segmented Action Dock
  segmentedActionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(18, 19, 22, 0.08)',
    shadowColor: '#121316',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: space[1],
  },
  segmentedPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFDEC4',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  segmentedTextPeach: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#8A3C1B',
  },
  segmentedCenterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#121316',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedPillRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#CEF5EB',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  segmentedTextMint: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#0E6852',
  },
  segmentedPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  // 3. Weekly 7-Day Pill Meter (#CEF5EB Pod)
  mintMeterPod: {
    backgroundColor: '#CEF5EB',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 104, 82, 0.12)',
    shadowColor: '#0E6852',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  mintPodTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  statusText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#0E6852',
    letterSpacing: 0.3,
  },
  statusRunning: {
    color: '#15803D',
  },
  statusPaused: {
    color: '#C2410C',
  },
  counterText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#0E6852',
  },
  dateStripWrapper: {
    marginVertical: space[1],
  },
  mintPodBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[2],
    marginTop: space[1],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14, 104, 82, 0.16)',
  },
  focusMinutesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  focusMinutesText: {
    fontSize: 12,
    color: '#0E6852',
  },
  focusMinutesBold: {
    fontFamily: fontFamily.bold,
    color: '#121316',
    fontSize: 12,
  },
  // 4. Quick Focus Action Dock
  hubActionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(18, 19, 22, 0.08)',
    gap: 8,
    shadowColor: '#121316',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  hubActionDockPressed: {
    backgroundColor: '#F7FAF9',
    transform: [{ scale: 0.99 }],
  },
  hubActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  hubActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubActionTexts: {
    flex: 1,
    gap: 1,
  },
  hubActionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#121316',
  },
  hubActionSub: {
    fontSize: 11,
    color: '#717684',
  },
  quickPlayActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#121316',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  quickPlayActionText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#CEF5EB',
  },
  // 5. Trantor Obsidian Black Pod for Upcoming Agenda (#121316)
  darkAgendaPod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121316',
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 14,
    shadowColor: '#121316',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  darkAgendaPodPressed: {
    backgroundColor: '#202227',
  },
  darkAgendaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  darkAgendaIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#CEF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkAgendaTexts: {
    flex: 1,
    gap: 2,
  },
  darkAgendaTime: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#CEF5EB',
    letterSpacing: 0.5,
  },
  darkAgendaTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  questSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[2],
    marginBottom: space[1],
  },
  questHeadingBold: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: '#121316',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFDEC4',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  addPillButtonPressed: {
    backgroundColor: '#F5CEB2',
  },
  addPillButtonDisabled: {
    opacity: 0.4,
  },
  addPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#121316',
  },
  // 6. Tasks Pod Wrapper
  tasksPodWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(18, 19, 22, 0.06)',
    paddingHorizontal: 14,
    shadowColor: '#121316',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  taskRowActive: {
    backgroundColor: '#F2FBF8',
    marginHorizontal: -14,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#0E6852',
  },
  taskRowCompleted: {
    opacity: 0.65,
  },
  taskRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(18, 19, 22, 0.08)',
  },
  taskCheckboxBtn: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D1D4DC',
    backgroundColor: '#F6F7F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxBoxDone: {
    backgroundColor: '#121316',
    borderColor: '#121316',
  },
  questDetailsCol: {
    flex: 1,
    gap: 2,
  },
  questMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  questDuration: {
    fontSize: 11,
    color: '#717684',
    fontFamily: fontFamily.medium,
  },
  questTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 19,
    color: '#121316',
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9499A8',
  },
  questTitleCancelled: {
    textDecorationLine: 'line-through',
    color: '#DC2626',
  },
  questSubtext: {
    fontSize: 12,
    lineHeight: 16,
    color: '#717684',
  },
  questSubtextDone: {
    color: '#0E6852',
    fontFamily: fontFamily.bold,
  },
  questSubtextCancelled: {
    color: '#DC2626',
    fontFamily: fontFamily.bold,
  },
  questActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questPlayBtnActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFDEC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 7. Floating Action Bar
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
    backgroundColor: '#121316',
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#121316',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  floatingBtnPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#202227',
  },
  floatingAddQuestText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
