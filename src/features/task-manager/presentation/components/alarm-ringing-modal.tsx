import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  AppState,
  Alert,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  BellRing,
  Play,
  Clock,
  Volume2,
  CalendarClock,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
import { colors } from '@/theme/colors';
import { layout, screenGutter, touchTarget, fontFamily, space, radius, stroke, typography } from '@/theme/tokens';
import { AppText } from '@/shared/ui';
import {
  formatDayAndDateIndo,
  type ManagedTaskEntity,
} from '../../domain/entities/managed-task.entity';
import {
  managedTaskRepository,
  subscribeRingingAlarm,
  clearRingingAlarm,
} from '../../data/repositories/managed-task.repository';
import { TaskAlarmAudioService } from '../../data/services/task-alarm-audio.service';

const s = colors.sprout;

export const AlarmRingingModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const gutter = screenGutter(width - insets.left - insets.right);
  const reducedMotion = useReducedMotion();
  const [ringingTask, setRingingTask] = useState<ManagedTaskEntity | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isTest, setIsTest] = useState(false);
  const pendingActions = useRef(new Set<string>());
  const [nowClock, setNowClock] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  });

  useEffect(() => {
    let testStopTimer: ReturnType<typeof setTimeout> | null = null;
    let generation = 0;
    let active = AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
    let currentTask: ManagedTaskEntity | null = null;
    let testingAlarm = false;
    const unsubscribe = subscribeRingingAlarm((task, testing) => {
      const currentGeneration = ++generation;
      if (testStopTimer) clearTimeout(testStopTimer);
      testStopTimer = null;
      setRingingTask(task);
      currentTask = task; testingAlarm = testing;
      setActionError(null);
      setIsTest(testing);
      if (task && active) {
        void TaskAlarmAudioService.startAlarmRinging(task.alarmTrackUri).catch(() => {
          if (currentGeneration === generation) setActionError('Suara alarm belum dapat diputar.');
        });
        if (testing) testStopTimer = setTimeout(() => {
          if (currentGeneration !== generation) return;
          TaskAlarmAudioService.stopAlarmRinging();
          clearRingingAlarm();
        }, 10_000);
      } else {
        TaskAlarmAudioService.stopAlarmRinging();
      }
    });

    const appState = AppState.addEventListener('change', state => {
      const wasActive = active;
      active = state === 'active';
      if (!active) TaskAlarmAudioService.stopAlarmRinging();
      else if (!wasActive && currentTask && !testingAlarm) {
        void TaskAlarmAudioService.startAlarmRinging(currentTask.alarmTrackUri).catch(() => setActionError('Suara alarm belum dapat diputar.'));
      }
    });

    const interval = setInterval(() => {
      const d = new Date();
      setNowClock(
        `${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes()
        ).padStart(2, '0')}`
      );
      if (active) void managedTaskRepository.checkDueAlarmsNow().catch(error => {
        console.error('[AlarmRingingModal] Gagal memeriksa alarm:', error);
      });
    }, 6000);

    return () => {
      generation++;
      unsubscribe();
      appState.remove();
      clearInterval(interval);
      if (testStopTimer) clearTimeout(testStopTimer);
      TaskAlarmAudioService.stopAlarmRinging();
      clearRingingAlarm();
    };
  }, []);

  if (!ringingTask) return null;

  const runAction = async (work: () => Promise<void>) => {
    const taskId = ringingTask.id;
    TaskAlarmAudioService.stopAlarmRinging();
    clearRingingAlarm();
    if (isTest || pendingActions.current.has(taskId)) return;
    pendingActions.current.add(taskId);
    try {
      await work();
    } catch (error) {
      Alert.alert('Alarm sudah dihentikan', error instanceof Error
        ? 'Perubahan tugas belum tersimpan: ' + error.message
        : 'Perubahan tugas belum tersimpan. Coba lagi dari Manajemen Tugas.');
    } finally { pendingActions.current.delete(taskId); }
  };

  const handleStartFocusNow = () => runAction(async () => {
    await managedTaskRepository.dismissTaskAlarm(ringingTask.id);
    router.push('/(tabs)' as any);
  });

  const handleSnooze = (minutes: number) => runAction(() => managedTaskRepository.snoozeTaskAlarm(ringingTask.id, minutes));

  const handleDismiss = () => runAction(() => managedTaskRepository.dismissTaskAlarm(ringingTask.id));

  const handleMarkDone = () => runAction(() => managedTaskRepository.toggleTaskCompletion(ringingTask.id));

  return (
    <Modal
      visible
      transparent={false}
      animationType={reducedMotion ? 'none' : 'fade'}
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={[styles.fullScreenRoot, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }]}>
        <View style={[styles.column, { paddingHorizontal: gutter }]}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.alarmBody}>
            {actionError && <View style={styles.errorNotice}>
              <AppText color="onErrorContainer" accessibilityLiveRegion="polite">{actionError}</AppText>
            </View>}
            {/* Top Pulsing Badge */}
            <View style={styles.topAlertPill}>
              <BellRing size={16} color={s.ink} strokeWidth={2.6} />
              <AppText style={styles.topAlertPillText}>
                {isTest ? 'Tes alarm, maksimal 10 detik' : 'Pengingat mulai tugas'}
              </AppText>
            </View>

            {/* Big Alarm Clock Readout */}
            <View style={styles.clockBlock}>
              <AppText style={styles.bigClockText} tabularNums>
                {nowClock}
              </AppText>
              <AppText style={styles.wakeHeadline}>
                {isTest ? 'Uji suara alarm' : 'Waktu mulai tugas'}
              </AppText>
            </View>

            {/* Center Task Details Card */}
            <View style={styles.taskCommandCard}>
              <View style={styles.contextBadgeRow}>
                <View style={styles.contextChip}>
                  <AppText style={styles.contextChipText}>
                    {ringingTask.courseOrContext || 'Tugas'}
                  </AppText>
                </View>
                <View style={styles.durationChip}>
                  <Clock size={12} color={s.forest} strokeWidth={2.4} />
                  <AppText style={styles.durationChipText}>
                    Estimasi {ringingTask.estimatedMinutes} mnt
                  </AppText>
                </View>
              </View>

              <AppText style={styles.taskTitleText}>{ringingTask.title}</AppText>

              {ringingTask.notes ? (
                <AppText style={styles.taskNotesText} numberOfLines={2}>
                  {ringingTask.notes}
                </AppText>
              ) : null}

              {/* Deadline Reminder Box */}
              <View style={styles.deadlineBanner}>
                <CalendarClock size={16} color={colors.warning} strokeWidth={2.4} />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.deadlineBannerLabel}>
                    Tenggat
                  </AppText>
                  <AppText style={styles.deadlineBannerValue}>
                    {formatDayAndDateIndo(ringingTask.deadlineDate)}, Pukul{' '}
                    {ringingTask.deadlineTime}
                  </AppText>
                </View>
              </View>

              {/* Playing Song Indicator */}
              <View style={styles.audioPlayingStrip}>
                <Volume2 size={16} color={s.forest} strokeWidth={2.5} />
                <AppText style={styles.audioPlayingText} numberOfLines={1}>
                  Pilihan suara alarm: {ringingTask.alarmTrackName}
                </AppText>
              </View>
            </View>

            {!isTest && <View style={styles.actionsStack}>
              {/* 1. Primary Action: Start Working Now */}
              <Pressable
                onPress={handleStartFocusNow}
                accessibilityRole="button"
                accessibilityLabel="Mulai kerjakan tugas sekarang"
                style={({ pressed }) => [
                  styles.startNowButton,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Play size={20} color={s.ink} fill={s.ink} strokeWidth={2.4} />
                <AppText style={styles.startNowButtonText}>
                  Mulai Kerjakan Sekarang
                </AppText>
              </Pressable>

              {/* 2. Snooze Options */}
              <View style={styles.snoozeBlock}>
                <AppText style={styles.snoozeHeaderLabel}>
                  Tunda selama
                </AppText>
                <View style={styles.snoozeButtonsRow}>
                  {[5, 10, 15].map((mins) => (
                    <Pressable
                      key={mins}
                      onPress={() => handleSnooze(mins)}
                      accessibilityRole="button"
                      accessibilityLabel={`Tunda alarm ${mins} menit`}
                      style={({ pressed }) => [
                        styles.snoozeBtn,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Clock size={13} color={colors.surfaceContainerLowest} strokeWidth={2.3} />
                      <AppText style={styles.snoozeBtnText}>+{mins} Menit</AppText>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 3. Secondary Actions: Mark Done or Dismiss */}
              <View style={styles.bottomSecondaryRow}>
                <Pressable
                  onPress={handleMarkDone}
                  accessibilityRole="button"
                  accessibilityLabel="Tandai tugas sudah selesai"
                  style={styles.secondaryActionBtn}
                >
                  <CheckCircle2 size={16} color={colors.onHeroMuted} strokeWidth={2.4} />
                  <AppText style={styles.secondaryActionText}>
                    Tandai Sudah Selesai
                  </AppText>
                </Pressable>

              </View>
            </View>}
          </ScrollView>
          <View style={styles.dismissFooter}>
            <Pressable onPress={handleDismiss} accessibilityRole="button"
              accessibilityLabel={isTest ? 'Hentikan tes alarm' : 'Matikan alarm'}
              style={({ pressed }) => [styles.startNowButton, pressed && { opacity: 0.8 }]}>
              <X size={20} color={s.ink} />
              <AppText style={styles.startNowButtonText}>{isTest ? 'Hentikan Tes Alarm' : 'Matikan Alarm'}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenRoot: { flex: 1, backgroundColor: colors.inverseSurface },
  column: { flex: 1, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' },
  scroll: { flex: 1 },
  alarmBody: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: layout.sectionGap, paddingVertical: layout.screenTop },
  errorNotice: { backgroundColor: colors.errorContainer, padding: space[3], borderRadius: radius.md, width: '100%' },
  dismissFooter: { paddingTop: space[2], paddingBottom: space[4] },
  topAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: s.sun,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
  },
  topAlertPillText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.7,
    color: s.ink,
  },
  clockBlock: {
    alignItems: 'center',
    gap: space[1],
  },
  bigClockText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.timer.fontSize,
    lineHeight: typography.timer.lineHeight,
    color: colors.surfaceContainerLowest,
  },
  wakeHeadline: {
    fontFamily: fontFamily.bold,
    fontSize: typography.titleMedium.fontSize,
    color: colors.onHeroMuted,
  },
  taskCommandCard: {
    width: '100%',
    backgroundColor: s.cream,
    borderRadius: radius.lg,
    padding: space[5],
    gap: space[3],
    borderWidth: stroke.selected,
    borderColor: s.sun,
  },
  contextBadgeRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  contextChip: {
    backgroundColor: s.leafSoft,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
  },
  contextChipText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
    letterSpacing: 0.4,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
  },
  durationChipText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  taskTitleText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.headlineMedium.fontSize,
    lineHeight: typography.headlineMedium.lineHeight,
    color: s.ink,
  },
  taskNotesText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    lineHeight: typography.labelMedium.lineHeight,
    color: s.inkMuted,
  },
  deadlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.warningContainer,
    borderWidth: stroke.hairline,
    borderColor: colors.warningContainer,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  deadlineBannerLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.5,
    color: colors.warning,
  },
  deadlineBannerValue: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.warning,
  },
  audioPlayingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: s.leafSoft,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  audioPlayingText: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  actionsStack: {
    width: '100%',
    gap: space[3],
  },
  startNowButton: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    backgroundColor: s.sun,
    borderRadius: radius.lg,
    paddingVertical: space[4],
    borderWidth: stroke.selected,
    borderColor: '#FFF3C4',
  },
  startNowButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.titleMedium.fontSize,
    color: s.ink,
  },
  snoozeBlock: {
    alignItems: 'center',
    gap: space[2],
  },
  snoozeHeaderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.8,
    color: colors.onHeroMuted,
  },
  snoozeButtonsRow: {
    flexDirection: 'row',
    gap: space[2],
    width: '100%',
  },
  snoozeBtn: {
    minHeight: touchTarget.min,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: stroke.hairline,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: radius.lg,
    paddingVertical: space[3],
  },
  snoozeBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.surfaceContainerLowest,
  },
  bottomSecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[2],
    marginTop: space[0.5],
  },
  secondaryActionBtn: {
    minHeight: touchTarget.min,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryActionText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.onHeroMuted,
  },
});

