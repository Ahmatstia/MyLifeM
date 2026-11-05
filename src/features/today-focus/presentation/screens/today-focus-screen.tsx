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
  const compassSize = 64;
  const strokeW = 5;
  const compRadius = (compassSize - strokeW) / 2;
  const compCircumference = 2 * Math.PI * compRadius;
  const progressRatio = activeItems.length > 0 ? completedCount / activeItems.length : 0;
  const compOffset = compCircumference * (1 - progressRatio);

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenBg}>
      {/* 1. Top Header: Brand + Settings */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <CheckCircle2 size={20} color="#805600" strokeWidth={2.4} />
          </View>
          <View style={styles.brandTextGroup}>
            <AppText variant="titleMedium" style={styles.brandTitle}>
              MyLife Focus
            </AppText>
            <AppText variant="labelSmall" style={styles.dateSubtext}>
              {todayFormatted}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Buka Pengaturan"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.settingsBtn}
        >
          <SettingsIcon size={18} color="#1E1E2E" strokeWidth={2} />
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
            {/* 2. 7-Day Date Strip */}
            <CapsuleDateStrip
              selectedDate={selectedDate}
              todayDate={todayDate}
              onSelectDate={(date) => {
                if (date === todayDate) setSelectedDate(date);
                else router.push({ pathname: '/agenda', params: { date } });
              }}
            />

            {/* 3. Focus Timer: Expanded Widget or Focus Hero */}
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
                {/* 3A. Productivity Progress & Energy Banner */}
                <View style={styles.heroCard}>
                  {/* Top Status Capsule */}
                  <View style={styles.heroStatusRow}>
                    <AppText variant="labelSmall" style={styles.expeditionTag}>
                      PRIORITAS HARIAN
                    </AppText>
                    <View style={styles.readyPill}>
                      <View style={styles.pulseDot} />
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
                  </View>

                  {/* Middle Row: Headline & Stylized Energy Orb Compass */}
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

                    {/* Micro Progress Compass Orb */}
                    <View style={styles.compassContainer}>
                      <Svg width={compassSize} height={compassSize} style={styles.compassSvg}>
                        <Circle
                          cx={compassSize / 2}
                          cy={compassSize / 2}
                          r={compRadius}
                          stroke="#E3E0F7"
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
                          / {activeItems.length}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Row: Productivity Metrics */}
                  <View style={styles.vitalityMeterRow}>
                    <View style={styles.vitalityTextGroup}>
                      <Clock size={15} color="#E06B52" strokeWidth={2.4} />
                      <AppText variant="bodySmall" style={styles.vitalityText}>
                        Waktu fokus: <AppText variant="labelMedium" style={styles.vitalityBold}>{completedMinutes} menit</AppText>
                      </AppText>
                    </View>

                    <View style={styles.taskDoneBadge}>
                      <CheckCircle2 size={13} color="#76A284" strokeWidth={2.4} />
                      <AppText variant="labelSmall" style={styles.taskDoneBadgeText}>
                        {completedCount}/{activeItems.length} selesai
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* 3B. Quick Play Focus Launcher Card */}
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
                    styles.quickPlayCard,
                    pressed && styles.quickPlayPressed,
                  ]}
                >
                  <View style={styles.quickPlayLeft}>
                    <View style={styles.quickPlayIconWrapper}>
                      <Play size={20} color="#805600" fill="#805600" />
                    </View>
                    <View style={styles.quickPlayTexts}>
                      <AppText variant="titleMedium" style={styles.quickPlayTitle} numberOfLines={1}>
                        {timer.activeTask?.title || nextTask?.title || 'Mulai Fokus'}
                      </AppText>
                      <AppText variant="bodySmall" style={styles.quickPlaySub}>
                        {timer.hasSession ? 'Sesi sedang berjalan' : 'Klik untuk masuk zona fokus'}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.quickPlayActionPill}>
                    <Timer size={14} color="#1E1E2E" />
                    <AppText variant="labelMedium" style={styles.quickPlayActionText}>
                      {timer.hasSession ? 'Lihat sesi fokus' : 'Mulai'}
                    </AppText>
                  </View>
                </Pressable>
              </>
            )}

            {/* 4. Agenda Terdekat (Next Schedule) */}
            {nextSchedule && (
              <Pressable
                onPress={() => router.push('/agenda' as any)}
                style={styles.agendaCard}
              >
                <View style={styles.agendaCardLeft}>
                  <View style={styles.agendaTagRow}>
                    <Clock size={12} color="#805600" />
                    <AppText variant="labelSmall" style={styles.agendaTagText}>
                      AGENDA BERIKUTNYA
                    </AppText>
                  </View>
                  <AppText variant="titleMedium" style={styles.agendaTitle} numberOfLines={1}>
                    {nextSchedule.schedule.title}
                  </AppText>
                  <AppText variant="bodySmall" style={styles.agendaTimeSubtitle} tabularNums>
                    {nextSchedule.schedule.startTime} – {nextSchedule.schedule.endTime} WIB
                    {nextSchedule.schedule.location ? ` • ${nextSchedule.schedule.location}` : ''}
                  </AppText>
                </View>

                <View style={styles.agendaChevronBox}>
                  <ChevronRight size={18} color="#1E1E2E" strokeWidth={2.5} />
                </View>
              </Pressable>
            )}

            {/* 5. Daftar Tugas Prioritas Hari Ini */}
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
                style={styles.addPillButton}
              >
                <Plus size={14} color="#1E1E2E" strokeWidth={2.5} />
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
                customIcon={<Sparkles size={30} color="#E8A838" strokeWidth={2.2} />}
                onActionPress={() => setIsAddModalVisible(true)}
              />
            ) : (
              focusItems.map((item) => {
                const isCompleted = item.isCompleted;
                const isCancelled = item.task.status === 'CANCELLED';
                const isActive = timer.activeTask?.id === item.taskId;

                const priorityBadge =
                  item.task.priority === 'HIGH'
                    ? { label: 'Tinggi', color: '#A23D28', bg: '#FFEBD9' }
                    : item.task.priority === 'LOW'
                      ? { label: 'Rendah', color: '#504535', bg: '#FAF5EB' }
                      : { label: 'Prioritas', color: '#805600', bg: '#FFF3DB' };

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.questRowCard,
                      isActive && styles.questRowActive,
                      isCompleted && styles.questRowCompleted,
                    ]}
                  >
                    {/* Left: Tactile Checkbox */}
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
                          <Check size={16} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </Pressable>

                    {/* Middle: Task Info */}
                    <View style={styles.questDetailsCol}>
                      {/* Priority Badge & Duration Row */}
                      <View style={styles.questMetaRow}>
                        <View style={[styles.tokenTag, { backgroundColor: priorityBadge.bg }]}>
                          <AppText variant="labelSmall" style={[styles.tokenText, { color: priorityBadge.color }]}>
                            {priorityBadge.label}
                          </AppText>
                        </View>
                        <View style={styles.durationTag}>
                          <Clock size={11} color="#504535" />
                          <AppText variant="bodySmall" style={styles.questDuration}>
                            {item.task.estimatedMinutes}m
                          </AppText>
                        </View>
                      </View>

                      {/* Task Title */}
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

                      {/* Subtext description or status */}
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
                        <X size={15} color="#504535" />
                      </Pressable>

                      {isCompleted ? null : isCancelled ? null : isActive ? (
                        <Pressable
                          onPress={timer.pauseTimer}
                          accessibilityRole="button"
                          accessibilityLabel={'Jeda fokus ' + item.task.title}
                          style={styles.questPlayBtnActive}
                        >
                          <Pause size={14} color="#FFFFFF" />
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
                          <Play size={13} color="#1E1E2E" fill="#1E1E2E" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {/* 6. Tips Fokus & Produktivitas */}
            <View style={styles.tipsBreakCard}>
              <View style={styles.tipsIconCircle}>
                <Zap size={18} color="#805600" />
              </View>
              <View style={styles.tipsTextContent}>
                <AppText variant="labelMedium" style={styles.tipsTitle}>
                  Prinsip Fokus & Produktivitas
                </AppText>
                <AppText variant="bodySmall" style={styles.tipsBody}>
                  Selesaikan 1–2 tugas prioritas utama di awal hari saat energi kognitif dan konsentrasi berada di puncak optimal.
                </AppText>
              </View>
            </View>

            {/* Extra padding at bottom for floating dock */}
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
          <Plus size={18} color="#FFFFFF" strokeWidth={2.8} />
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
    backgroundColor: '#FCF8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[2],
    paddingBottom: space[2],
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFDDAF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextGroup: {
    gap: 0,
  },
  brandTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: '#1E1E2E',
  },
  dateSubtext: {
    fontSize: 12,
    color: '#504535',
    fontFamily: fontFamily.medium,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
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
  heroCard: {
    backgroundColor: '#FAF5EB',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: space[4],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 3,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  expeditionTag: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#805600',
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#76A284',
  },
  readyPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#1E1E2E',
  },
  heroMiddleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[3],
    marginVertical: space[2],
  },
  heroTextCol: {
    flex: 1,
  },
  heroHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#1E1E2E',
    lineHeight: 20,
  },
  heroMissionsCount: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: '#805600',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#504535',
    lineHeight: 18,
  },
  compassContainer: {
    position: 'relative',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
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
    fontSize: 17,
    lineHeight: 19,
    color: '#1E1E2E',
  },
  compassSubNum: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    color: '#504535',
  },
  vitalityMeterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.12)',
    paddingTop: space[3],
    marginTop: space[3],
  },
  vitalityTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vitalityText: {
    fontSize: 13,
    color: '#504535',
  },
  vitalityBold: {
    fontFamily: fontFamily.bold,
    color: '#1E1E2E',
    fontSize: 13,
  },
  taskDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  taskDoneBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#1E1E2E',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  quickPlayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFDDAF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: 14,
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 3,
  },
  quickPlayPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 1, height: 1 },
  },
  quickPlayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    flex: 1,
  },
  quickPlayIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPlayTexts: {
    flex: 1,
    gap: 2,
  },
  quickPlayTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#1E1E2E',
  },
  quickPlaySub: {
    fontSize: 13,
    color: '#504535',
  },
  quickPlayActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  quickPlayActionText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: 14,
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  agendaCardLeft: {
    flex: 1,
    gap: 3,
  },
  agendaTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  agendaTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#805600',
    letterSpacing: 0.5,
  },
  agendaTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#1E1E2E',
  },
  agendaTimeSubtitle: {
    fontSize: 13,
    color: '#504535',
  },
  agendaChevronBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[3],
    marginBottom: space[1],
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  questHeadingBold: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: '#1E1E2E',
  },
  maxItemsLabel: {
    fontSize: 12,
    color: '#504535',
  },
  addPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFDAD3',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  addPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  questRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: 14,
    gap: 12,
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  questRowActive: {
    backgroundColor: '#FFDDAF',
    borderColor: '#805600',
  },
  questRowCompleted: {
    backgroundColor: '#F7F7FA',
    opacity: 0.85,
  },
  taskCheckboxBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1E1E2E',
    backgroundColor: '#FAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxBoxDone: {
    backgroundColor: '#76A284',
    borderColor: '#1E1E2E',
  },
  questDetailsCol: {
    flex: 1,
    gap: 3,
  },
  questMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  tokenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.15)',
  },
  tokenText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  questDuration: {
    fontSize: 12,
    color: '#504535',
    fontFamily: fontFamily.medium,
  },
  questTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 21,
    color: '#1E1E2E',
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: '#837563',
  },
  questTitleCancelled: {
    textDecorationLine: 'line-through',
    color: '#BA1A1A',
  },
  questSubtext: {
    fontSize: 12,
    lineHeight: 16,
    color: '#504535',
  },
  questSubtextDone: {
    color: '#76A284',
    fontFamily: fontFamily.bold,
  },
  questSubtextCancelled: {
    color: '#BA1A1A',
    fontFamily: fontFamily.bold,
  },
  questActionGroup: {
    alignItems: 'center',
    gap: 6,
  },
  questRemoveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFDDAF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questPlayBtnActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E06B52',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsBreakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: 14,
  },
  tipsIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFDAD3',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTextContent: {
    flex: 1,
    gap: 2,
  },
  tipsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#1E1E2E',
  },
  tipsBody: {
    fontSize: 12,
    color: '#504535',
    lineHeight: 18,
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
    backgroundColor: '#E06B52',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#1E1E2E',
    paddingVertical: 14,
    paddingHorizontal: space[6],
    width: '100%',
    maxWidth: 340,
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  floatingBtnPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 1, height: 1 },
  },
  floatingAddQuestText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
