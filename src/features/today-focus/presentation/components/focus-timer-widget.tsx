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
} from 'lucide-react-native';
import { MinuteDial } from './minute-dial';
import { todayColors as c } from '@/theme/today';
import { space, fontFamily, radius, touchTarget, typography } from '@/theme/tokens';
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
  seconds?: number;
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
  seconds,
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
    typography.displayLarge.fontSize,
    (width - 4 * space[5] - 4) /
      (Math.max(5, formattedTime.length) * 0.66 * Math.max(1, fontScale))
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.activeTaskStrip}>
        <View style={styles.activeTaskLeft}>
          <View style={styles.activeTaskTexts}>
            <AppText variant="labelMedium" color="onSurfaceVariant">Tugas fokus</AppText>
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

              style={({ pressed }) => [styles.stripSmallBtn, pressed && styles.buttonPressed]}
            >
              <X size={space[4]} color={c.ink} />
            </Pressable>
          )}

          {onMinimize && (
            <Pressable
              onPress={onMinimize}
              accessibilityRole="button"
              accessibilityLabel="Ciutkan tampilan timer"

              style={({ pressed }) => [styles.stripSmallBtn, pressed && styles.buttonPressed]}
            >
              <ChevronUp size={space[5]} color={c.ink} />
            </Pressable>
          )}
        </View>
      </View>

      {!hasSession && <Pressable accessibilityRole="button" accessibilityLabel="Siapkan fokus 5 menit" onPress={()=>onChangeMode('POMODORO',5)} style={{minHeight:48,justifyContent:'center',alignItems:'center'}}><AppText color={c.skyInk}>Mulai kecil: siapkan 5 menit</AppText></Pressable>}
      <View style={styles.orbitDisplayCard}>
        <View style={[styles.readout, fontScale >= 1.5 && styles.stackedControls]}>
          <MinuteDial minutes={seconds === undefined ? undefined : seconds / 60} />
          <View style={styles.digitsColumn}>
            <AppText variant="timer" tabularNums style={[styles.timerDigits, { fontSize: digitSize }]}>{formattedTime}</AppText>
            <AppText style={styles.timerSubtitle}>{mode === 'STOPWATCH' ? 'Waktu berjalan' : 'Waktu tersisa'}</AppText>
          </View>
        </View>
        {mode !== 'STOPWATCH' && <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }]} />
        </View>}
      </View>
      <View style={styles.modeSection}>
        <View style={[styles.modeCardsRow, fontScale >= 1.5 && styles.stackedControls]}>
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
              (!ready || hasSession) && styles.disabled,
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
              (!ready || hasSession) && styles.disabled,
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
              (!ready || hasSession) && styles.disabled,
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
        <AppText variant="bodySmall" style={styles.lockHintText}>
          {hasSession
            ? 'Mode dan tugas dikunci sampai sesi dicatat. Jeda tidak dihitung.'
            : mode === 'STOPWATCH'
              ? 'Akhiri sesi untuk mencatat durasi aktif.'
              : `Durasi sesi berikutnya: ${selectedMinutes ?? (mode === 'POMODORO' ? preferences.pomodoroMinutes : preferences.deepFlowMinutes)} menit.`}
        </AppText>
      </View>
      <View style={styles.controlsSection}>
        <Pressable
          disabled={!ready}
          accessibilityState={{ disabled: !ready, busy: !ready }}
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
            !ready && styles.disabled,
            isRunning ? styles.mainActionRunning : styles.mainActionIdle,
            pressed && styles.buttonPressed,
          ]}
        >
          {isRunning ? (
            <Pause size={space[5]} color={c.card} />
          ) : (
            <Play size={space[5]} color={c.ink} fill={c.ink} />
          )}
          <AppText
            variant="titleMedium"
            style={[
              styles.mainActionButtonText,
              isRunning && { color: c.card },
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
        <View style={[styles.secondaryActionsRow, fontScale >= 1.5 && styles.stackedControls]}>
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
              <Check size={space[4]} color={c.ink} strokeWidth={2.5} />
              <AppText variant="labelMedium" style={styles.finishBtnText}>
                Akhiri & catat
              </AppText>
            </Pressable>
          )}
          <Pressable
            onPress={onReset}
            disabled={hasSession || !ready}
            accessibilityState={{ disabled: hasSession || !ready }}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"

            style={({ pressed }) => [
              styles.resetBtn,
              (hasSession || !ready) && styles.disabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <RotateCcw size={space[4]} color={c.ink} />
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
  container: { width: '100%', minWidth: 0, gap: space[3], backgroundColor: c.card, borderRadius: radius.xxl, padding: space[3] },
  activeTaskStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[1] },
  activeTaskLeft: { flex: 1, minWidth: 0 },
  activeTaskTexts: { gap: space[1] },
  activeTaskTitle: { color: c.ink, fontFamily: fontFamily.bold },
  activeTaskActions: { flexDirection: 'row' },
  stripSmallBtn: { width: touchTarget.min, height: touchTarget.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  orbitDisplayCard: { backgroundColor: c.sky, borderRadius: radius.xxl, padding: space[4] },
  readout: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  digitsColumn: { flexShrink: 1, alignItems: 'flex-start' },
  timerDigits: { fontFamily: fontFamily.display, color: c.ink, lineHeight: typography.timer.lineHeight },
  timerSubtitle: { color: c.muted },
  progressTrack: { width: '100%', height: space[1], backgroundColor: c.line, marginTop: space[3] },
  progressFill: { height: '100%', backgroundColor: c.ink },
  modeSection: { gap: space[2] },
  modeCardsRow: { flexDirection: 'row', gap: space[1] },
  modeCard: { flex: 1, minWidth: 0, minHeight: touchTarget.min, alignItems: 'center', justifyContent: 'center', paddingVertical: space[2], paddingHorizontal: space[1], borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  modeCardActive: { borderColor: c.ink, backgroundColor: c.lilac },
  modeCardTitle: { color: c.ink, textAlign: 'center' },
  modeCardTitleActive: { fontFamily: fontFamily.bold },
  modeCardSub: { color: c.muted, textAlign: 'center' },
  modeCardSubActive: { color: c.lilacInk },
  lockHintText: { color: c.muted },
  controlsSection: { gap: space[2] },
  mainActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], minHeight: touchTarget.min, borderRadius: radius.pill, padding: space[2] },
  mainActionIdle: { backgroundColor: c.gold },
  mainActionRunning: { backgroundColor: c.ink },
  mainActionButtonText: { color: c.ink, fontFamily: fontFamily.bold },
  buttonPressed: { opacity: 0.8 },
  disabled: { backgroundColor: c.completed },
  secondaryActionsRow: { flexDirection: 'row', gap: space[2] },
  stackedControls: { flexDirection: 'column' },
  finishBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], minHeight: touchTarget.min, borderColor: c.line, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.pill },
  finishBtnText: { color: c.ink },
  resetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], minHeight: touchTarget.min, borderRadius: radius.pill },
  resetBtnText: { color: c.muted },
});
