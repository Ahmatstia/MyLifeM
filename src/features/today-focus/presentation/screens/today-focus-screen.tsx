import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Plus, CheckCircle, Sparkles, Flame, Settings } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, touchTarget } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { EmptyState } from '@/shared/ui/empty-state';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { PriorityTaskCard } from '../components/priority-task-card';
import { AddPriorityModal } from '../components/add-priority-modal';
import {
  SessionReflectionModal,
  type SessionReflectionData,
} from '../components/session-reflection-modal';

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
    year: 'numeric',
  });

  const completedCount = focusItems.filter((i) => i.isCompleted).length;

  return (
    <Screen>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <AppText variant="headlineLarge">Hari Ini & Fokus</AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {todayFormatted}
          </AppText>
        </View>

        <View style={styles.headerRightRow}>
          {/* Daily Total Focus Badge */}
          <View style={styles.todayStatsBadge}>
            <Flame size={16} color={colors.highlight} />
            <AppText variant="labelMedium" color="highlight" tabularNums style={styles.todayStatsText}>
              {completedMinutes} mnt
            </AppText>
          </View>

          {/* Settings Button */}
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Buka Pengaturan"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.settingsButton}
          >
            <Settings size={20} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>

      {/* Integrated Focus Timer Cockpit */}
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
      />

      {/* Section Header: Prioritas Hari Ini */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <AppText variant="titleMedium">Prioritas Hari Ini</AppText>
          <AppText variant="labelMedium" color="onSurfaceVariant" tabularNums style={styles.counterText}>
            ({completedCount}/{focusItems.length} selesai)
          </AppText>
        </View>

        <Button
          title="+ Tambah"
          variant="tonal"
          size="compact"
          disabled={focusItems.length >= 5}
          onPress={() => setIsAddModalVisible(true)}
        />
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
          <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.loadingText}>
            Memuat tugas prioritas...
          </AppText>
        </View>
      )}

      {/* Empty State when no priority items for today */}
      {!isLoading && focusItems.length === 0 && (
        <EmptyState
          title="Belum Ada Prioritas Terpilih"
          description="Pilih 3 hingga 5 tugas utama hari ini (The Rule of 3-5 Priorities) agar eksekusimu tajam dan bebas dari rasa kewalahan."
          customIcon={<Sparkles size={32} color={colors.onPrimaryContainer} />}
          actionTitle="Pilih Prioritas Hari Ini"
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
    marginBottom: space[3],
  },
  headerTitleBox: {
    flex: 1,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  settingsButton: {
    width: touchTarget.compact,
    height: touchTarget.compact,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  todayStatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  todayStatsText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
    marginBottom: space[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  counterText: {
    marginLeft: 2,
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
