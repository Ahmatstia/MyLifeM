import React, { useState } from 'react';
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
  Sparkles,
  Settings as SettingsIcon,
  X,
  Plus,
  Clock,
  Timer,
  CalendarDays,
  Repeat,
} from 'lucide-react-native';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { useAgenda } from '@/features/agenda/presentation/hooks/use-agenda';
import { usePrayerTimes } from '@/features/prayer-times/presentation/hooks/use-prayer-times';
import { PrayerTimesWidget } from '@/features/prayer-times/presentation/components/prayer-times-widget';
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

  // Focus items metrics
  const completedCount = focusItems.filter((item) => item.isCompleted).length;
  const activeItems = focusItems.filter((item) => item.task.status !== 'CANCELLED');
  const remainingCount = Math.max(0, activeItems.length - completedCount);
  const nextTask = activeItems.find((item) => !item.isCompleted)?.task;

  // Agenda metrics for today
  const activeOccurrences = weeklyOccurrences.filter((occ) => !occ.isCancelled);
  const totalAgendaCount = events.length + activeOccurrences.length;
  const completedAgendaCount =
    events.filter((e) => e.isCompleted).length +
    activeOccurrences.filter((occ) => occ.isCompleted).length;

  // Combined progress
  const totalActionables = activeItems.length + totalAgendaCount;
  const totalCompletedActionables = completedCount + completedAgendaCount;

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
            {/* 2. Hero Cockpit Pod (Organically Asymmetric Mint Pod #CEF5EB) */}
            <View style={styles.heroPod}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroPillBadge}>
                  <AppText variant="labelSmall" style={styles.heroPillText}>
                    TARGET HARI INI
                  </AppText>
                </View>

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
                        : `${remainingCount} Prioritas Siap`}
                </AppText>
              </View>

              <View style={styles.heroMainRow}>
                <View style={styles.heroStatsCol}>
                  <AppText variant="headlineMedium" style={styles.heroProgressNum}>
                    {totalCompletedActionables}/{totalActionables} Selesai
                  </AppText>
                  <AppText variant="bodySmall" style={styles.heroProgressSub}>
                    {remainingCount} prioritas · {totalAgendaCount - completedAgendaCount} agenda tersisa
                  </AppText>
                </View>

                <View style={styles.heroMinutesPill}>
                  <Clock size={13} color="#0E6852" strokeWidth={2.4} />
                  <AppText variant="labelMedium" style={styles.heroMinutesNum}>
                    {completedMinutes}m fokus
                  </AppText>
                </View>
              </View>
            </View>

            {/* 3. Jadwal Shalat & Azan Widget */}
            <PrayerTimesWidget schedule={prayerSchedule} />

            {/* 4. Trantor Segmented Action Dock */}
            <View style={styles.segmentedActionDock}>
              {/* Left Pill: Mulai Fokus / Timer */}
              <Pressable
                onPress={() => {
                  if (!nextTask && !timer.activeTask && !timer.hasSession) {
                    router.push('/today/new');
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
                onPress={() => router.push('/today/new')}
                accessibilityRole="button"
                accessibilityLabel="Tambah Tugas"
                style={({ pressed }) => [
                  styles.segmentedCenterCircle,
                  pressed && styles.segmentedPressed,
                ]}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={3} />
              </Pressable>

              {/* Right Pill: Add Agenda Shortcut */}
              <Pressable
                onPress={() => router.push('/agenda/new')}
                style={({ pressed }) => [
                  styles.segmentedPillRight,
                  pressed && styles.segmentedPressed,
                ]}
              >
                <AppText variant="labelMedium" style={styles.segmentedTextMint}>
                  + Agenda
                </AppText>
                <CalendarDays size={13} color="#0E6852" />
              </Pressable>
            </View>

            {/* 5. Focus Timer: Expanded Widget or Tactile Quick Dock */}
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
                    router.push('/today/new');
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

            {/* 6. Section: Tugas Prioritas Hari Ini */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <AppText variant="titleMedium" style={styles.sectionHeadingBold}>
                  Tugas Prioritas Hari Ini
                </AppText>
                <AppText variant="labelSmall" style={styles.sectionCountHint}>
                  {completedCount}/{focusItems.length} selesai
                </AppText>
              </View>

              <Pressable
                onPress={() => router.push('/today/new')}
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
                onActionPress={() => router.push('/today/new')}
              />
            ) : (
              <View style={styles.tasksPodWrapper}>
                {focusItems.map((item, index) => {
                  const isCompleted = item.isCompleted;
                  const isCancelled = item.task.status === 'CANCELLED';
                  const isActive = timer.activeTask?.id === item.taskId;
                  const isLast = index === focusItems.length - 1;

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

                      {/* Center: Task Information */}
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

            {/* 7. Section: Agenda & Jadwal Hari Ini */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <AppText variant="titleMedium" style={styles.sectionHeadingBold}>
                  Agenda & Jadwal Hari Ini
                </AppText>
                <AppText variant="labelSmall" style={styles.sectionCountHint}>
                  {completedAgendaCount}/{totalAgendaCount} selesai
                </AppText>
              </View>

              <Pressable
                onPress={() => router.push('/agenda/new')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={({ pressed }) => [
                  styles.addPillButton,
                  pressed && styles.addPillButtonPressed,
                ]}
              >
                <Plus size={13} color="#121316" strokeWidth={2.8} />
                <AppText variant="labelSmall" style={styles.addPillText}>
                  Jadwalkan
                </AppText>
              </Pressable>
            </View>

            {totalAgendaCount === 0 ? (
              <View style={styles.emptyAgendaPod}>
                <CalendarDays size={24} color="#717684" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <AppText variant="labelMedium" style={styles.emptyAgendaTitle}>
                    Tidak ada agenda khusus hari ini
                  </AppText>
                  <AppText variant="bodySmall" color="onSurfaceVariant">
                    Waktumu leluasa untuk fokus pada tugas prioritas di atas.
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={styles.agendaPodWrapper}>
                {/* Regular today events */}
                {events.map((ev, idx) => {
                  const startTime = ev.isAllDay
                    ? 'Sepanjang hari'
                    : new Date(ev.startTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                  const isDone = ev.isCompleted;
                  const isLast = idx === events.length - 1 && activeOccurrences.length === 0;

                  return (
                    <View
                      key={ev.id}
                      style={[
                        styles.agendaRow,
                        isDone && styles.agendaRowDone,
                        !isLast && styles.agendaRowDivider,
                      ]}
                    >
                      <Pressable
                        onPress={() => toggleEvent(ev.id, isDone)}
                        accessibilityRole="checkbox"
                        aria-checked={isDone}
                        accessibilityState={{ checked: isDone }}
                        accessibilityLabel={(isDone ? 'Buka kembali ' : 'Selesaikan ') + ev.title}
                        style={styles.taskCheckboxBtn}
                      >
                        <View style={[styles.taskCheckboxBox, isDone && styles.taskCheckboxBoxDone]}>
                          {isDone && <Check size={13} color="#CEF5EB" strokeWidth={3} />}
                        </View>
                      </Pressable>

                      <View style={styles.agendaDetailsCol}>
                        <AppText variant="labelSmall" style={styles.agendaTimeText}>
                          {startTime}
                        </AppText>
                        <AppText
                          variant="titleSmall"
                          style={[styles.agendaTitle, isDone && styles.agendaTitleDone]}
                          numberOfLines={1}
                        >
                          {ev.title}
                        </AppText>
                      </View>
                    </View>
                  );
                })}

                {/* Repeating weekly occurrences */}
                {activeOccurrences.map((occ, idx) => {
                  const isDone = occ.isCompleted;
                  const isLast = idx === activeOccurrences.length - 1;

                  return (
                    <View
                      key={occ.schedule.id}
                      style={[
                        styles.agendaRow,
                        isDone && styles.agendaRowDone,
                        !isLast && styles.agendaRowDivider,
                      ]}
                    >
                      <Pressable
                        onPress={() => toggleWeeklyOccurrence(occ.schedule.id, isDone)}
                        accessibilityRole="checkbox"
                        aria-checked={isDone}
                        accessibilityState={{ checked: isDone }}
                        accessibilityLabel={(isDone ? 'Buka kembali ' : 'Selesaikan ') + occ.schedule.title}
                        style={styles.taskCheckboxBtn}
                      >
                        <View style={[styles.taskCheckboxBox, isDone && styles.taskCheckboxBoxDone]}>
                          {isDone && <Check size={13} color="#CEF5EB" strokeWidth={3} />}
                        </View>
                      </Pressable>

                      <View style={styles.agendaDetailsCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Repeat size={11} color="#0E6852" />
                          <AppText variant="labelSmall" style={styles.agendaTimeText}>
                            {occ.schedule.startTime} – {occ.schedule.endTime}
                          </AppText>
                        </View>
                        <AppText
                          variant="titleSmall"
                          style={[styles.agendaTitle, isDone && styles.agendaTitleDone]}
                          numberOfLines={1}
                        >
                          {occ.schedule.title}
                        </AppText>
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

      {/* 8. Floating Action Button (Petak di sudut kanan bawah) */}
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
          <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
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
    backgroundColor: '#FAF9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[2],
    paddingBottom: space[2],
  },
  headerTextCol: {
    gap: 2,
  },
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 32,
    color: '#121316',
  },
  dateSubtext: {
    fontFamily: fontFamily.medium,
    color: '#717684',
    fontSize: 13,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnPressed: {
    backgroundColor: '#F3F4F6',
  },
  notice: {
    marginBottom: space[2],
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  scrollContent: {
    paddingBottom: 90,
    gap: space[3],
  },
  // 2. Hero Cockpit Pod
  heroPod: {
    backgroundColor: '#CEF5EB',
    borderRadius: 24,
    padding: space[4],
    gap: space[3],
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroPillBadge: {
    backgroundColor: '#0E6852',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: '#CEF5EB',
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroStatsCol: {
    gap: 2,
  },
  heroProgressNum: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: '#0E6852',
  },
  heroProgressSub: {
    fontFamily: fontFamily.medium,
    color: '#125B50',
    fontSize: 12,
  },
  heroMinutesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroMinutesNum: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#0E6852',
  },
  statusText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#0E6852',
  },
  statusRunning: {
    color: '#0E6852',
  },
  statusPaused: {
    color: '#B45309',
  },
  // 4. Segmented Action Dock
  segmentedActionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentedPillLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFEBD9',
    borderRadius: 999,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F3D5C0',
  },
  segmentedTextPeach: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#8A3C1B',
  },
  segmentedCenterCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#121316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedPillRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#CEF5EB',
    borderRadius: 999,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3EBDC',
  },
  segmentedTextMint: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#0E6852',
  },
  segmentedPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  // 5. Hub Action Dock
  hubActionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121316',
    borderRadius: 22,
    padding: space[4],
  },
  hubActionDockPressed: {
    backgroundColor: '#202226',
  },
  hubActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    flex: 1,
  },
  hubActionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#26292F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubActionTexts: {
    flex: 1,
    gap: 2,
  },
  hubActionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  hubActionSub: {
    color: '#A0A4B0',
    fontSize: 12,
  },
  quickPlayActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#26292F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  quickPlayActionText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#CEF5EB',
  },
  // Sections
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[1],
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  sectionHeadingBold: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: '#121316',
  },
  sectionCountHint: {
    fontFamily: fontFamily.medium,
    color: '#717684',
    fontSize: 12,
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  addPillButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  addPillButtonDisabled: {
    opacity: 0.4,
  },
  addPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#121316',
  },
  // Task Pod Wrapper
  tasksPodWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    gap: space[3],
    backgroundColor: '#FFFFFF',
  },
  taskRowActive: {
    backgroundColor: '#F7FCFA',
  },
  taskRowCompleted: {
    opacity: 0.55,
  },
  taskRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskCheckboxBtn: {
    padding: 4,
  },
  taskCheckboxBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#C4C7D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  taskCheckboxBoxDone: {
    backgroundColor: '#0E6852',
    borderColor: '#0E6852',
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
  },
  questDuration: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: '#717684',
  },
  questTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#121316',
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: '#717684',
  },
  questTitleCancelled: {
    textDecorationLine: 'line-through',
    color: '#9499A8',
  },
  questSubtext: {
    fontSize: 11,
    color: '#717684',
  },
  questSubtextDone: {
    color: '#0E6852',
  },
  questSubtextCancelled: {
    color: '#9499A8',
  },
  questActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questRemoveBtn: {
    padding: 6,
  },
  questPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questPlayBtnActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CEF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Agenda Pod Wrapper
  agendaPodWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    overflow: 'hidden',
  },
  emptyAgendaPod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  emptyAgendaTitle: {
    fontFamily: fontFamily.bold,
    color: '#121316',
    fontSize: 13,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    gap: space[3],
    backgroundColor: '#FFFFFF',
  },
  agendaRowDone: {
    opacity: 0.55,
  },
  agendaRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  agendaDetailsCol: {
    flex: 1,
    gap: 2,
  },
  agendaTimeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#0E6852',
  },
  agendaTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#121316',
  },
  agendaTitleDone: {
    textDecorationLine: 'line-through',
    color: '#717684',
  },
  // Floating Action Button (Petak di sudut kanan bawah)
  floatingFabContainer: {
    position: 'absolute',
    bottom: space[4],
    right: space[4],
  },
  fabSquare: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#121316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#26292F',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: '#26292F',
  },
});
