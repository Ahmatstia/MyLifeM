import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronUp,
  Check,
  Target,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import type { UserSettingsEntity } from '@/features/settings/domain/entities/settings.entity';
import { DEFAULT_SETTINGS } from '@/features/settings/domain/entities/settings.entity';
import { AppText } from '@/shared/ui/app-text';
import type {
  FocusTimerMode,
  TaskEntity,
} from '../../domain/entities/daily-focus.entity';

export interface FocusTimerWidgetProps {
  ready?: boolean;
  hasSession?: boolean;
  selectedMinutes?: number;
  preferences?: UserSettingsEntity;
  onFinish?: () => void;
  mode: FocusTimerMode;
  formattedTime: string;
  isRunning: boolean;
  activeTask: Pick<TaskEntity, 'id' | 'title'> | null;
  progressRatio: number;
  onChangeMode: (mode: FocusTimerMode, minutes?: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onClearActiveTask?: () => void;
  onMinimize?: () => void;
  style?: ViewStyle;
}

export const FocusTimerWidget: React.FC<FocusTimerWidgetProps> = ({
  ready = true,
  hasSession = false,
  selectedMinutes,
  preferences = DEFAULT_SETTINGS,
  onFinish,
  mode,
  formattedTime,
  isRunning,
  activeTask,
  progressRatio,
  onChangeMode,
  onStart,
  onPause,
  onReset,
  onClearActiveTask,
  onMinimize,
  style,
}) => {
  const { width, fontScale } = useWindowDimensions();
  const digitSize = Math.min(
    48,
    (width - 4 * space[5] - 4) /
      (Math.max(5, formattedTime.length) * 0.66 * Math.max(1, fontScale))
  );


  return (
    <View style={[styles.container, style]}>
      {/* 1. Active Focus Task Strip */}
      <View style={styles.activeTaskStrip}>
        <View style={styles.activeTaskLeft}>
          <View style={styles.targetIconCircle}>
            <Target size={18} color="#805600" />
          </View>
          <View style={styles.activeTaskTexts}>
            <AppText variant="labelSmall" style={styles.activeTaskTag}>
              TUGAS FOKUS
            </AppText>
            <AppText
              variant="titleSmall"
              style={styles.activeTaskTitle}
            >
              {activeTask ? activeTask.title : 'Fokus Mandiri'}
            </AppText>
          </View>
        </View>

        <View style={styles.activeTaskActions}>
          {activeTask && onClearActiveTask && !hasSession && (
            <Pressable
              onPress={onClearActiveTask}
              accessibilityRole="button"
              accessibilityLabel="Lepas tugas"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.stripSmallBtn}
            >
              <X size={14} color="#1E1E2E" />
            </Pressable>
          )}

          {onMinimize && (
            <Pressable
              onPress={onMinimize}
              accessibilityRole="button"
              accessibilityLabel="Ciutkan tampilan timer"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.stripSmallBtn}
            >
              <ChevronUp size={18} color="#1E1E2E" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.orbitDisplayCard}>
        <AppText variant="timer" tabularNums style={[styles.timerDigits, { fontSize: digitSize }]}>{formattedTime}</AppText>
        <AppText style={styles.timerSubtitle}>{isRunning ? 'Konsentrasi penuh' : 'Ruang untuk satu hal.'}</AppText>
        {mode !== 'STOPWATCH' && <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }]} />
        </View>}
      </View>

      {/* 3. Session Mode Selector */}
      <View style={styles.modeSection}>
        <View style={[styles.modeCardsRow, fontScale >= 1.5 && styles.stackedControls]}>
          {/* Mode 1: Pomodoro */}
          <Pressable
            onPress={() => onChangeMode('POMODORO')}
            disabled={hasSession || !ready}
            accessibilityRole="button"
            accessibilityState={{
              selected: mode === 'POMODORO',
              disabled: hasSession || !ready,
            }}
            style={[
              styles.modeCard,
              mode === 'POMODORO' && styles.modeCardActive,
            ]}
          >
            <AppText
              variant="labelMedium"
              style={[
                styles.modeCardTitle,
                mode === 'POMODORO' && styles.modeCardTitleActive,
              ]}
            >
              Fokus Penuh
            </AppText>
            <AppText
              variant="bodySmall"
              style={[
                styles.modeCardSub,
                mode === 'POMODORO' && styles.modeCardSubActive,
              ]}
            >
              {`Pomodoro ${mode === 'POMODORO' && selectedMinutes !== undefined ? selectedMinutes : preferences.pomodoroMinutes}m`}
            </AppText>
          </Pressable>

          {/* Mode 2: Deep Flow */}
          <Pressable
            onPress={() => onChangeMode('DEEP_FLOW')}
            disabled={hasSession || !ready}
            accessibilityRole="button"
            accessibilityState={{
              selected: mode === 'DEEP_FLOW',
              disabled: hasSession || !ready,
            }}
            style={[
              styles.modeCard,
              mode === 'DEEP_FLOW' && styles.modeCardActive,
            ]}
          >
            <AppText
              variant="labelMedium"
              style={[
                styles.modeCardTitle,
                mode === 'DEEP_FLOW' && styles.modeCardTitleActive,
              ]}
            >
              Deep Work
            </AppText>
            <AppText
              variant="bodySmall"
              style={[
                styles.modeCardSub,
                mode === 'DEEP_FLOW' && styles.modeCardSubActive,
              ]}
            >
              {`Deep Flow ${mode === 'DEEP_FLOW' && selectedMinutes !== undefined ? selectedMinutes : preferences.deepFlowMinutes}m`}
            </AppText>
          </Pressable>

          {/* Mode 3: Stopwatch / Bebas */}
          <Pressable
            onPress={() => onChangeMode('STOPWATCH')}
            disabled={hasSession || !ready}
            accessibilityRole="button"
            accessibilityState={{
              selected: mode === 'STOPWATCH',
              disabled: hasSession || !ready,
            }}
            style={[
              styles.modeCard,
              mode === 'STOPWATCH' && styles.modeCardActive,
            ]}
          >
            <AppText
              variant="labelMedium"
              style={[
                styles.modeCardTitle,
                mode === 'STOPWATCH' && styles.modeCardTitleActive,
              ]}
            >
              Timer Bebas
            </AppText>
            <AppText
              variant="bodySmall"
              style={[
                styles.modeCardSub,
                mode === 'STOPWATCH' && styles.modeCardSubActive,
              ]}
            >
              Bebas
            </AppText>
          </Pressable>
        </View>

        {/* Lock note / Duration hint (Must contain required text for tests!) */}
        <AppText variant="bodySmall" style={styles.lockHintText}>
          {hasSession
            ? 'Mode dan tugas dikunci sampai sesi dicatat. Jeda tidak dihitung.'
            : mode === 'STOPWATCH'
              ? 'Akhiri sesi untuk mencatat durasi aktif.'
              : `Durasi sesi berikutnya: ${selectedMinutes ?? (mode === 'POMODORO' ? preferences.pomodoroMinutes : preferences.deepFlowMinutes)} menit.`}
        </AppText>
      </View>

      {/* 4. Play/Pause/Reset Productivity Controls */}
      <View style={styles.controlsSection}>
        {/* Main Action Button */}
        <Pressable
          disabled={!ready}
          onPress={isRunning ? onPause : onStart}
          accessibilityRole="button"
          accessibilityLabel={
            isRunning
              ? 'Jeda sesi fokus'
              : hasSession
                ? 'Lanjutkan sesi fokus'
                : 'Mulai sesi fokus'
          }
          style={({ pressed }) => [
            styles.mainActionButton,
            isRunning ? styles.mainActionRunning : styles.mainActionIdle,
            pressed && styles.buttonPressed,
          ]}
        >
          {isRunning ? (
            <Pause size={22} color="#FFFFFF" />
          ) : (
            <Play size={22} color="#1E1E2E" fill="#1E1E2E" />
          )}
          <AppText
            variant="titleMedium"
            style={[
              styles.mainActionButtonText,
              isRunning && { color: '#FFFFFF' },
            ]}
          >
            {!ready
              ? 'Memuat…'
              : isRunning
                ? 'Jeda Sesi'
                : hasSession
                  ? 'Lanjutkan Fokus'
                  : 'Mulai Fokus'}
          </AppText>
        </Pressable>

        {/* Secondary Actions Row */}
        <View style={[styles.secondaryActionsRow, fontScale >= 1.5 && styles.stackedControls]}>
          {/* Finish & Record Button */}
          {hasSession && onFinish && (
            <Pressable
              onPress={onFinish}
              accessibilityRole="button"
              accessibilityLabel="Akhiri dan catat sesi"
              style={({ pressed }) => [
                styles.finishBtn,
                pressed && styles.buttonPressed,
              ]}
            >
              <Check size={16} color="#1E1E2E" strokeWidth={2.5} />
              <AppText variant="labelMedium" style={styles.finishBtnText}>
                Akhiri & catat
              </AppText>
            </Pressable>
          )}

          {/* Reset Button */}
          <Pressable
            onPress={onReset}
            disabled={hasSession || !ready}
            accessibilityState={{ disabled: hasSession || !ready }}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.resetBtn,
              pressed && styles.buttonPressed,
            ]}
          >
            <RotateCcw size={16} color="#1E1E2E" />
            <AppText variant="labelMedium" style={styles.resetBtnText}>
              Reset Timer
            </AppText>
          </Pressable>
        </View>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  stackedControls: { flexDirection: 'column' },
  progressTrack: { width: '100%', height: 3, backgroundColor: '#456252', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: colors.sprout.sun },
  container: { width: '100%', backgroundColor: colors.sprout.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 12, },
  activeTaskStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, },
  activeTaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    flex: 1,
  },
  targetIconCircle: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.sprout.sunSoft, alignItems: 'center', justifyContent: 'center', },
  activeTaskTexts: {
    flex: 1,
    gap: 2,
  },
  activeTaskTag: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#805600',
  },
  activeTaskTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: '#1E1E2E',
  },
  activeTaskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripSmallBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.sprout.creamDeep, alignItems: 'center', justifyContent: 'center', },
  orbitDisplayCard: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sprout.forest, borderRadius: 12, padding: 16, },



  timerDigits: { fontFamily: fontFamily.bold, color: '#FFFFFF', letterSpacing: -2, lineHeight: 60, },
  timerSubtitle: { fontSize: 11, color: '#E7EDDC', },





  modeSection: { gap: 4, },
  modeCardsRow: {
    flexDirection: 'row',
    gap: space[2],
    marginBottom: space[1],
  },
  modeCard: { flex: 1, minWidth: 0, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 4, },
  modeCardActive: { backgroundColor: colors.sprout.sunSoft, borderColor: colors.sprout.forest, },
  modeCardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  modeCardTitleActive: {
    color: '#1E1E2E',
  },
  modeCardSub: {
    fontSize: 10,
    color: '#504535',
    marginTop: 2,
    textAlign: 'center',
  },
  modeCardSubActive: {
    color: '#805600',
    fontFamily: fontFamily.bold,
  },
  lockHintText: {
    fontSize: 11,
    color: '#504535',
    marginTop: 4,
    textAlign: 'center',
  },
  controlsSection: { gap: 8, },
  mainActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 48, paddingVertical: 10, borderRadius: 10, },
  mainActionIdle: { backgroundColor: colors.sprout.sun, },
  mainActionRunning: { backgroundColor: colors.sprout.forest, },
  mainActionButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#1E1E2E',
    letterSpacing: 0.3,
  },
  buttonPressed: { opacity: 0.8, },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  finishBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 8, },
  finishBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  resetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 8, },
  resetBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },

});
