import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
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
import { colors } from '@/theme/colors';
import { fontFamily, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui';
import {
  formatDayAndDateIndo,
  type ManagedTaskEntity,
} from '../../domain/entities/managed-task.entity';
import {
  managedTaskRepository,
  subscribeRingingAlarm,
} from '../../data/repositories/managed-task.repository';
import { TaskAlarmAudioService } from '../../data/services/task-alarm-audio.service';

const s = colors.sprout;

export const AlarmRingingModal: React.FC = () => {
  const [ringingTask, setRingingTask] = useState<ManagedTaskEntity | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [nowClock, setNowClock] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  });

  useEffect(() => {
    const unsubscribe = subscribeRingingAlarm((task) => {
      setRingingTask(task);
      setActionError(null);
      if (task) {
        void TaskAlarmAudioService.startAlarmRinging(task.alarmTrackUri);
      } else {
        TaskAlarmAudioService.stopAlarmRinging();
      }
    });

    const interval = setInterval(() => {
      const d = new Date();
      setNowClock(
        `${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes()
        ).padStart(2, '0')}`
      );
      void managedTaskRepository.checkDueAlarmsNow().catch(error => {
        console.error('[AlarmRingingModal] Gagal memeriksa alarm:', error);
      });
    }, 6000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      TaskAlarmAudioService.stopAlarmRinging();
    };
  }, []);

  if (!ringingTask) return null;

  const runAction = async (work: () => Promise<void>) => {
    try {
      setActionError(null);
      await work();
      TaskAlarmAudioService.stopAlarmRinging();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Perubahan alarm belum tersimpan. Coba lagi.');
    }
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
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.fullScreenRoot}>
        {actionError && <AppText color="error" accessibilityLiveRegion="polite">{actionError}</AppText>}
        {/* Top Pulsing Badge */}
        <View style={styles.topAlertPill}>
          <BellRing size={16} color={s.ink} strokeWidth={2.6} />
          <AppText style={styles.topAlertPillText}>
            ALARM EKSEKUSI TUGAS AKTIF
          </AppText>
        </View>

        {/* Big Alarm Clock Readout */}
        <View style={styles.clockBlock}>
          <AppText style={styles.bigClockText} tabularNums>
            {nowClock}
          </AppText>
          <AppText style={styles.wakeHeadline}>
            Waktunya Kerjakan Tugasmu! 🔥
          </AppText>
        </View>

        {/* Center Task Details Card */}
        <View style={styles.taskCommandCard}>
          <View style={styles.contextBadgeRow}>
            <View style={styles.contextChip}>
              <AppText style={styles.contextChipText}>
                {ringingTask.courseOrContext || 'TUGAS UTAMA'}
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
            <CalendarClock size={16} color="#B84A27" strokeWidth={2.4} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.deadlineBannerLabel}>
                BATAS PENGUMPULAN (DEADLINE)
              </AppText>
              <AppText style={styles.deadlineBannerValue}>
                {formatDayAndDateIndo(ringingTask.deadlineDate)} · Pukul{' '}
                {ringingTask.deadlineTime}
              </AppText>
            </View>
          </View>

          {/* Playing Song Indicator */}
          <View style={styles.audioPlayingStrip}>
            <Volume2 size={16} color={s.forest} strokeWidth={2.5} />
            <AppText style={styles.audioPlayingText} numberOfLines={1}>
              Memutar Lagu Alarm: {ringingTask.alarmTrackName}
            </AppText>
          </View>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.actionsStack}>
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
              TUNDA ALARM (SNOOZE)
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
                  <Clock size={13} color="#FFFFFF" strokeWidth={2.3} />
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
              style={styles.secondaryActionBtn}
            >
              <CheckCircle2 size={16} color="#B8F1D0" strokeWidth={2.4} />
              <AppText style={styles.secondaryActionText}>
                Tandai Sudah Selesai
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleDismiss}
              accessibilityRole="button"
              style={styles.secondaryActionBtn}
            >
              <X size={16} color="#E2E8F0" strokeWidth={2.4} />
              <AppText style={styles.secondaryActionText}>
                Matikan Alarm
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenRoot: {
    flex: 1,
    backgroundColor: '#102A22',
    paddingHorizontal: space[5],
    paddingTop: 58,
    paddingBottom: 38,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: s.sun,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  topAlertPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.7,
    color: s.ink,
  },
  clockBlock: {
    alignItems: 'center',
    gap: 4,
  },
  bigClockText: {
    fontFamily: fontFamily.bold,
    fontSize: 64,
    lineHeight: 72,
    color: '#FFFFFF',
  },
  wakeHeadline: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#B8F1D0',
  },
  taskCommandCard: {
    width: '100%',
    backgroundColor: s.cream,
    borderRadius: 30,
    padding: space[5],
    gap: space[3],
    borderWidth: 2,
    borderColor: s.sun,
  },
  contextBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  contextChip: {
    backgroundColor: s.leafSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  contextChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
    letterSpacing: 0.4,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFE8D5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  durationChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
  },
  taskTitleText: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: s.ink,
  },
  taskNotesText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: s.inkMuted,
  },
  deadlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF3EC',
    borderWidth: 1,
    borderColor: '#F5D0BD',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  deadlineBannerLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#B84A27',
  },
  deadlineBannerValue: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#7A2810',
  },
  audioPlayingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: s.leafSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  audioPlayingText: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.forest,
  },
  actionsStack: {
    width: '100%',
    gap: space[3],
  },
  startNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: s.sun,
    borderRadius: 24,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#FFF3C4',
  },
  startNowButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: s.ink,
  },
  snoozeBlock: {
    alignItems: 'center',
    gap: 8,
  },
  snoozeHeaderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#9EC5B5',
  },
  snoozeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  snoozeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 11,
  },
  snoozeBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomSecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryActionText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#E2E8F0',
  },
});

