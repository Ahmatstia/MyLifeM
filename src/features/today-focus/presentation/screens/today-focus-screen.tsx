import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Settings, Play } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, elevation } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressRing } from '@/shared/ui/progress-ring';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { PriorityTaskCard } from '../components/priority-task-card';
import { AddPriorityModal } from '../components/add-priority-modal';
import {
  SessionReflectionModal,
  type SessionReflectionData,
} from '../components/session-reflection-modal';

/**
 * TodayFocusScreen: Desain Cute Marshmallow Minimal.
 * - Header lapang dengan pill tanggal bernuansa pastel.
 * - Centerpiece Focus Capsule yang rapi dan elegan (tidak ada dua widget raksasa yang saling bertumpuk).
 * - Timer dapat dibuka secara fluid saat dibutuhkan, menjaga layar tetap bersih & zen.
 * - Bebas dari tumpukan ikon/emoji yang berlebihan.
 */
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
    recordSession,
  } = useTodayFocus();

  // State untuk timer yang dibuka/diciutkan
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);

  // State for post-session reflection modal
  const [reflectionState, setReflectionState] = useState<{
    visible: boolean;
    durationMinutes: number;
    startedAt: string;
    endedAt: string;
    mode: 'POMODORO' | 'DEEP_FLOW' | 'STOPWATCH';
    taskId: string | null;
    taskTitle?: string;
  }>({
    visible: false,
    durationMinutes: 0,
    startedAt: '',
    endedAt: '',
    mode: 'POMODORO',
    taskId: null,
  });

  // State for Add Priority Modal
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsAddModalVisible(true));

  // Focus Timer Hook
  const timer = useFocusTimer({
    onSessionFinish: (data) => {
      setReflectionState({
        visible: true,
        durationMinutes: data.durationMinutes,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
        mode: data.mode,
        taskId: data.taskId,
        taskTitle: timer.activeTask?.title,
      });
    },
  });

  // Handle reflection submission
  const handleSaveReflection = async (data: SessionReflectionData) => {
    await recordSession({
      taskId: reflectionState.taskId,
      mode: reflectionState.mode,
      startedAt: reflectionState.startedAt,
      endedAt: reflectionState.endedAt,
      durationMinutes: reflectionState.durationMinutes,
      rating: data.rating,
      obstacle: data.obstacle,
      nextAction: data.nextAction,
    });
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const completedCount = focusItems.filter((i) => i.isCompleted).length;
  const showFullTimer = timer.isRunning || timer.activeTask !== null || isTimerExpanded;

  return (
    <Screen>
      {/* 1. Header Lapang & Adorable */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText variant="headlineLarge" color="onSurface" style={styles.greetingTitle}>
            Hari Ini
          </AppText>
          <View style={styles.datePill}>
            <AppText variant="labelMedium" color="primary">
              {todayFormatted}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Buka Pengaturan"
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.btnPressed]}
        >
          <Settings size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      {/* 2. Interactive Focus Capsule / Timer Cockpit */}
      {showFullTimer ? (
        <FocusTimerWidget
          mode={timer.mode}
          formattedTime={timer.formattedTime}
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
        /* Unified Hero Capsule: Bersih, Empuk, & Menyenangkan */
        <Card variant="elevated" padding={space[4]} style={styles.heroCapsule}>
          <View style={styles.heroInnerRow}>
            <ProgressRing
              value={completedCount}
              total={focusItems.length}
              size={84}
              strokeWidth={8}
              tone="default"
              label="Selesai"
            />

            <View style={styles.heroDetailsCol}>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Fokus Hari Ini
              </AppText>
              <AppText variant="headlineLarge" color="primary" tabularNums style={styles.focusMinutesText}>
                {completedMinutes} <AppText variant="bodyMedium" color="onSurfaceVariant">mnt</AppText>
              </AppText>

              <View style={styles.heroBadgeRow}>
                <View style={styles.priorityCountBadge}>
                  <AppText variant="labelSmall" color="onPrimaryContainer">
                    {focusItems.length === 0
                      ? 'Atur prioritasmu'
                      : `${focusItems.length} prioritas aktif`}
                  </AppText>
                </View>

                <Pressable
                  onPress={() => setIsTimerExpanded(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Buka timer fokus"
                  style={({ pressed }) => [styles.quickStartPill, pressed && styles.btnPressed]}
                >
                  <Play size={12} color={colors.onPrimary} fill={colors.onPrimary} />
                  <AppText variant="labelSmall" color="onPrimary" style={styles.quickStartText}>
                    Fokus
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* 3. Section Header: Prioritas Hari Ini */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <AppText variant="titleLarge" color="onSurface">
            Prioritas
          </AppText>
          <View style={styles.counterBubble}>
            <AppText variant="labelSmall" color="primary" tabularNums>
              {completedCount}/{focusItems.length}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => setIsAddModalVisible(true)}
          disabled={focusItems.length >= 5}
          accessibilityRole="button"
          accessibilityLabel="Tambah prioritas hari ini"
          style={({ pressed }) => [
            styles.addPillBtn,
            focusItems.length >= 5 && styles.addPillDisabled,
            pressed && styles.btnPressed,
          ]}
        >
          <AppText
            variant="labelMedium"
            color={focusItems.length >= 5 ? 'onSurfaceSubtle' : 'onPrimaryContainer'}
          >
            + Tambah
          </AppText>
        </Pressable>
      </View>

      {/* Error Notice */}
      {error && (
        <Banner
          variant="error"
          message={error}
          actionText="Coba Lagi"
          onActionPress={refresh}
          style={styles.bannerMargin}
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.loadingText}>
            Memuat tugas prioritas...
          </AppText>
        </View>
      )}

      {/* Empty State when no priority items for today */}
      {!isLoading && focusItems.length === 0 && (
        <EmptyState
          title="Belum Ada Prioritas Hari Ini"
          description="Pilih 3 hingga 5 tugas utama agar eksekusimu terarah dan tidak merasa kewalahan."
          actionTitle="Pilih Prioritas"
          onActionPress={() => setIsAddModalVisible(true)}
          style={styles.emptyMargin}
        />
      )}

      {/* List of Today's Focus Tasks */}
      {!isLoading &&
        focusItems.map((item) => {
          const isActiveTimer = timer.activeTask?.id === item.taskId;
          return (
            <PriorityTaskCard
              key={item.id}
              item={item}
              isActiveTimerTask={isActiveTimer}
              onToggleComplete={() => toggleTask(item.taskId, item.isCompleted)}
              onStartFocus={() => {
                timer.setActiveTask(item.task);
                timer.startTimer();
                setIsTimerExpanded(true);
              }}
              onRemove={() => removeFromToday(item.id)}
            />
          );
        })}

      {/* Modal Tambah Prioritas */}
      <AddPriorityModal
        visible={isAddModalVisible}
        availableTasks={availableTasks}
        currentCount={focusItems.length}
        onClose={() => setIsAddModalVisible(false)}
        onAddQuickTask={addQuickTask}
        onSelectExistingTask={addTaskToToday}
      />

      {/* Modal Refleksi Pasca-Fokus */}
      <SessionReflectionModal
        visible={reflectionState.visible}
        durationMinutes={reflectionState.durationMinutes}
        taskTitle={reflectionState.taskTitle}
        onClose={() => setReflectionState((prev) => ({ ...prev, visible: false }))}
        onSubmit={handleSaveReflection}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
    marginBottom: space[4],
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  greetingTitle: {
    letterSpacing: -0.5,
  },
  datePill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...elevation.level1,
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  heroCapsule: {
    marginBottom: space[4],
    borderRadius: radius.xxl,
  },
  heroInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
  },
  heroDetailsCol: {
    flex: 1,
  },
  focusMinutesText: {
    marginVertical: 2,
    letterSpacing: -0.5,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[1],
  },
  priorityCountBadge: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  quickStartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    gap: 4,
    ...elevation.level1,
  },
  quickStartText: {
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[2],
    marginBottom: space[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  counterBubble: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  addPillBtn: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 6,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  addPillDisabled: {
    opacity: 0.4,
  },
  bannerMargin: {
    marginVertical: space[2],
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[8],
  },
  loadingText: {
    marginTop: space[2],
  },
  emptyMargin: {
    marginTop: space[2],
  },
});
