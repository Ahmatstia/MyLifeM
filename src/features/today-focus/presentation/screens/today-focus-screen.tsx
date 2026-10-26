import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Settings, ArrowUpRight, Play } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Screen, ScreenHeader, AppText, Card, Button, Banner, EmptyState } from '@/shared/ui';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';
import { useTodayFocus } from '../hooks/use-today-focus';
import { useFocusTimer } from '../hooks/use-focus-timer';
import { FocusTimerWidget } from '../components/focus-timer-widget';
import { PriorityTaskCard } from '../components/priority-task-card';
import { AddPriorityModal } from '../components/add-priority-modal';
import { SessionReflectionModal } from '../components/session-reflection-modal';

export const TodayFocusScreen: React.FC = () => {
  const { focusItems, completedMinutes, availableTasks, isLoading, error, refresh,
    toggleTask, addQuickTask, addTaskToToday, removeFromToday } = useTodayFocus();
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsAddModalVisible(true));
  const timer = useFocusTimer({ onSessionRecorded: refresh });

  const completedCount = focusItems.filter(item => item.isCompleted).length;
  const activeItems = focusItems.filter(item => item.task.status !== 'CANCELLED');
  const nextTask = activeItems.find(item => !item.isCompleted)?.task;
  const todayFormatted = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen>
      <ScreenHeader title="Hari Ini." subtitle={todayFormatted}
        action={<Pressable onPress={() => router.push('/settings')} accessibilityRole="button"
          accessibilityLabel="Buka Pengaturan" style={styles.settingsButton}>
          <Settings size={22} color={colors.primary} />
        </Pressable>}
      />

      {timer.error && <Banner variant="error" message={timer.error} actionText="Coba lagi" onActionPress={timer.retry} style={styles.notice} />}
      {error && <Banner variant="error" message={error} actionText="Coba lagi" onActionPress={refresh} style={styles.notice} />}

      {isLoading ? <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /><AppText color="onSurfaceVariant">Menyiapkan harimu…</AppText></View> : !error && (
        <>
          {isTimerExpanded ? (
            <FocusTimerWidget mode={timer.mode} formattedTime={timer.formattedTime}
              ready={timer.ready} hasSession={timer.hasSession} preferences={timer.preferences} selectedMinutes={timer.selectedMinutes} onFinish={timer.finishTimer}
              isRunning={timer.isRunning} activeTask={timer.activeTask} progressRatio={timer.progressRatio}
              onChangeMode={timer.changeMode} onStart={timer.startTimer} onPause={timer.pauseTimer}
              onReset={timer.resetTimer} onClearActiveTask={() => timer.setActiveTask(null)}
              onMinimize={() => setIsTimerExpanded(false)} />
          ) : (
            <Card variant="hero" padding={space[6]} style={styles.hero}>
              <AppText variant="labelMedium" color="highlight" style={styles.eyebrow}>
                {timer.reflection ? 'SESI SUDAH TERCATAT' : timer.isRunning ? 'SESI SEDANG BERJALAN' : timer.hasSession ? 'SESI SEDANG DIJEDA' : 'RUANG UNTUK YANG PENTING'}
              </AppText>
              <AppText variant="headlineLarge" color="onHero" style={styles.heroTitle}>
                {timer.hasSession ? timer.formattedTime : 'Satu langkah\nlebih dekat.'}
              </AppText>
              <AppText variant="bodyMedium" color="onHeroMuted" style={styles.heroDescription}>
                {timer.activeTask?.title || nextTask?.title || 'Mulai dari satu hal kecil yang ingin kamu tuntaskan hari ini.'}
              </AppText>
              <Button title={timer.hasSession ? 'Lihat sesi fokus' : nextTask || timer.activeTask ? 'Buka timer fokus' : 'Pilih prioritas'}
                variant="accent" rightIcon={<ArrowUpRight size={18} color={colors.onHighlight} />}
                onPress={() => {
                  if (!nextTask && !timer.activeTask && !timer.hasSession) {
                    setIsAddModalVisible(true);
                  } else {
                    if (!timer.hasSession && !timer.activeTask && nextTask) timer.setActiveTask(nextTask);
                    setIsTimerExpanded(true);
                  }
                }}
                style={styles.heroAction} />
            </Card>
          )}

          <View style={styles.stats}>
            <View style={[styles.stat, styles.sageStat]}>
              <AppText variant="headlineLarge" tabularNums>{completedCount} / {activeItems.length}</AppText>
              <AppText variant="bodySmall" color="onPrimaryContainer">prioritas aktif selesai</AppText>
            </View>
            <View style={[styles.stat, styles.peachStat]}>
              <AppText variant="headlineLarge" color="onSecondaryContainer" tabularNums>{completedMinutes} mnt</AppText>
              <AppText variant="bodySmall" color="onSecondaryContainer">waktu fokus tercatat</AppText>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <AppText variant="headlineSmall" accessibilityRole="header" style={styles.sectionTitle}>Yang penting hari ini</AppText>
            <Button title="+ Tambah" variant="text" size="compact" disabled={focusItems.length >= 5}
              onPress={() => setIsAddModalVisible(true)} />
          </View>
          {focusItems.length === 0 ? <EmptyState title="Mulai dari satu langkah"
            description="Pilih tugas dari roadmap atau tulis tugas baru. Sisakan ruang untuk jeda di harimu."
            actionTitle="Pilih prioritas" onActionPress={() => setIsAddModalVisible(true)} /> :
            focusItems.map(item => <PriorityTaskCard key={item.id} item={item}
              isActiveTimerTask={timer.activeTask?.id === item.taskId}
              onToggleComplete={() => toggleTask(item.taskId, item.isCompleted || item.task.status === 'CANCELLED')}
              onStartFocus={() => {
                if (!timer.hasSession) timer.setActiveTask(item.task);
                setIsTimerExpanded(true);
              }}
              onRemove={() => removeFromToday(item.id)} />)}
          <View style={styles.bottomNote}>
            <Play size={16} color={colors.primary} />
            <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.noteText}>Rencana boleh disesuaikan. Fokus pada langkah yang masuk akal untukmu hari ini.</AppText>
          </View>
        </>
      )}

      <AddPriorityModal visible={isAddModalVisible} availableTasks={availableTasks}
        currentCount={focusItems.length} onClose={() => setIsAddModalVisible(false)}
        onAddQuickTask={addQuickTask} onSelectExistingTask={addTaskToToday} />
      {timer.reflection && <SessionReflectionModal key={timer.reflection.id} visible durationMinutes={Math.floor(timer.reflection.elapsedMs / 60_000)}
        taskTitle={timer.reflection.taskTitle ?? undefined} onClose={timer.dismissReflection} onSubmit={timer.saveReflection} />}

    </Screen>
  );
};

const styles = StyleSheet.create({
  settingsButton: { width: 48, height: 48, backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  hero: { marginBottom: space[5] },
  eyebrow: { letterSpacing: 1, marginBottom: space[4] },
  heroTitle: { marginBottom: space[3], paddingRight: space[4] },
  heroDescription: { marginBottom: space[5], paddingRight: space[3] },
  heroAction: { alignSelf: 'flex-start' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], marginBottom: space[4] },
  stat: { flex: 1, minWidth: 128, padding: space[4], borderRadius: radius.lg, gap: space[1] },
  sageStat: { backgroundColor: colors.primaryContainer },
  peachStat: { backgroundColor: colors.secondaryContainer },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2], marginVertical: space[3] },
  sectionTitle: { flex: 1, minWidth: 160 },
  notice: { marginBottom: space[4] },
  loading: { paddingVertical: space[10], alignItems: 'center', gap: space[3] },
  bottomNote: { flexDirection: 'row', gap: space[3], padding: space[4], marginTop: space[4] },
  noteText: { flex: 1 },
});
