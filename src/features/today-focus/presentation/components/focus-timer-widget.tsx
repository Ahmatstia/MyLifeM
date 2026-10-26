import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { Play, Pause, RotateCcw, X, ChevronUp, Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget, elevation } from '@/theme/tokens';
import type { UserSettingsEntity } from '@/features/settings/domain/entities/settings.entity';
import { DEFAULT_SETTINGS } from '@/features/settings/domain/entities/settings.entity';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import { ProgressBar } from '@/shared/ui/progress-bar';
import type {
  FocusTimerMode,
  TaskEntity,
} from '../../domain/entities/daily-focus.entity';

export interface FocusTimerWidgetProps {
  ready?: boolean; hasSession?: boolean; selectedMinutes?: number; preferences?: UserSettingsEntity; onFinish?: () => void;
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

/**
 * FocusTimerWidget: Desain Cute Marshmallow Minimal.
 * - Tanpa tumpukan ikon dekoratif (bebas emoji/ikon berlebih).
 * - Mode selector berbentuk pil pastel yang empuk dan responsif.
 * - Angka timer besar dengan tipografi Plus Jakarta Sans yang ramah.
 */
export const FocusTimerWidget: React.FC<FocusTimerWidgetProps> = ({
  ready = true, hasSession = false, selectedMinutes, preferences = DEFAULT_SETTINGS, onFinish,
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
  const digitSize = Math.min(52, (width - 4 * space[5] - 4) / (Math.max(5, formattedTime.length) * 0.66 * Math.max(1, fontScale)));
  return (
    <Card variant="elevated" padding={space[5]} style={[styles.container, style]}>
      {/* Top Header: Mode Title & Optional Minimize */}
      <View style={styles.topHeader}>
        <View style={styles.titleBadge}>
          <AppText variant="labelMedium" color="primary">
            Sesi Fokus
          </AppText>
        </View>

        {onMinimize && (
          <Pressable
            onPress={onMinimize}
            accessibilityRole="button"
            accessibilityLabel="Ciutkan tampilan timer"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.minimizeBtn}
          >
            <ChevronUp size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        )}
      </View>

      {/* Mode Selector: 3 Pil Pastel Tanpa Ikon Berlebih */}
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => onChangeMode('POMODORO')}
          disabled={hasSession || !ready}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'POMODORO', disabled: hasSession || !ready }}
          style={[
            styles.modePill,
            mode === 'POMODORO' && styles.modePillActive,
          ]}
        >
          <AppText
            variant="labelSmall"
            color={mode === 'POMODORO' ? 'onPrimary' : 'onSurfaceVariant'}
            style={styles.modeText}
          >
            Pomodoro {hasSession && mode === 'POMODORO' ? selectedMinutes : preferences.pomodoroMinutes}m
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode('DEEP_FLOW')}
          disabled={hasSession || !ready}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'DEEP_FLOW', disabled: hasSession || !ready }}
          style={[
            styles.modePill,
            mode === 'DEEP_FLOW' && styles.modePillActive,
          ]}
        >
          <AppText
            variant="labelSmall"
            color={mode === 'DEEP_FLOW' ? 'onPrimary' : 'onSurfaceVariant'}
            style={styles.modeText}
          >
            Deep Flow {hasSession && mode === 'DEEP_FLOW' ? selectedMinutes : preferences.deepFlowMinutes}m
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode('STOPWATCH')}
          disabled={hasSession || !ready}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'STOPWATCH', disabled: hasSession || !ready }}
          style={[
            styles.modePill,
            mode === 'STOPWATCH' && styles.modePillActive,
          ]}
        >
          <AppText
            variant="labelSmall"
            color={mode === 'STOPWATCH' ? 'onPrimary' : 'onSurfaceVariant'}
            style={styles.modeText}
          >
            Bebas
          </AppText>
        </Pressable>
      </View>

      <AppText variant="bodySmall" color="onSurfaceVariant">{hasSession ? 'Mode dan tugas dikunci sampai sesi dicatat. Jeda tidak dihitung.' : mode === 'STOPWATCH' ? 'Akhiri sesi untuk mencatat durasi aktif.' : `Durasi sesi berikutnya: ${selectedMinutes ?? (mode === 'POMODORO' ? preferences.pomodoroMinutes : preferences.deepFlowMinutes)} menit.`}</AppText>
      {/* Tautan Tugas yang Sedang Difokuskan */}
      {activeTask ? (
        <View style={styles.activeTaskPill}>
          <AppText variant="labelSmall" color="onPrimaryContainer" style={styles.activeTaskText}>
            Fokus: {activeTask.title}
          </AppText>
          {onClearActiveTask && !hasSession && (
            <Pressable
              onPress={onClearActiveTask}
              accessibilityRole="button"
              accessibilityLabel="Lepas tugas"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <X size={14} color={colors.onPrimaryContainer} />
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.idleTaskPill}>
          <AppText variant="labelSmall" color="onSurfaceSubtle">
            Fokus Mandiri
          </AppText>
        </View>
      )}

      {/* Angka Timer Besar & Ramah */}
      <View style={styles.digitsWrapper}>
        <AppText variant="timer" color="onSurface" align="center" tabularNums style={[styles.timerDigits, { fontSize: digitSize, lineHeight: digitSize * 1.15 }]}>
          {formattedTime}
        </AppText>
      </View>

      {/* Indikator Progres Berbentuk Pil Lembut */}
      {mode !== 'STOPWATCH' && (
        <ProgressBar
          progress={progressRatio * 100}
          color={isRunning ? colors.primary : colors.surfaceContainerHighest}
          height={8}
          style={styles.progressBar}
        />
      )}

      {/* Tombol Kontrol: Reset Bundar & CTA Pil Lebar */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={onReset}
          disabled={hasSession || !ready}
          accessibilityState={{ disabled: hasSession || !ready }}
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.resetButton}
        >
          <RotateCcw size={18} color={colors.onSurfaceVariant} />
        </Pressable>

        <Pressable
          disabled={!ready}
          onPress={isRunning ? onPause : onStart}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? 'Jeda sesi fokus' : hasSession ? 'Lanjutkan sesi fokus' : 'Mulai sesi fokus'}
          style={({ pressed }) => [
            styles.ctaPill,
            isRunning ? styles.ctaPillRunning : styles.ctaPillIdle,
            pressed && styles.ctaPressed,
          ]}
        >
          {isRunning ? (
            <Pause size={18} color={colors.onSurface} style={styles.ctaIcon} />
          ) : (
            <Play size={18} color={colors.onPrimary} style={styles.ctaIcon} />
          )}
          <AppText
            variant="titleMedium"
            color={isRunning ? 'onSurface' : 'onPrimary'}
            style={styles.ctaText}
          >
            {!ready ? 'Memuat…' : isRunning ? 'Jeda' : hasSession ? 'Lanjutkan' : 'Mulai Fokus'}
          </AppText>
        </Pressable>
      </View>
      {hasSession && onFinish && <Button title="Akhiri & catat" variant="outlined" onPress={onFinish} leftIcon={<Check size={18} color={colors.primary} />} style={{ marginTop: space[3] }} />}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
    marginBottom: space[4],
    borderRadius: radius.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  titleBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
  },
  minimizeBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    marginBottom: space[3],
  },
  modePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    minHeight: 48,
    padding: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  modePillActive: {
    backgroundColor: colors.primary,
    ...elevation.level1,
  },
  modeText: {
    letterSpacing: 0.2,
  },
  activeTaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 6,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: space[2],
    maxWidth: '92%',
    gap: space[2],
  },
  activeTaskText: {
    flexShrink: 1,
  },
  clearBtn: {
    width: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleTaskPill: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    marginBottom: space[2],
  },
  digitsWrapper: {
    paddingVertical: space[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -1,
  },
  progressBar: {
    marginVertical: space[3],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    marginTop: space[2],
  },
  resetButton: {
    width: touchTarget.min,
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPill: {
    flex: 1,
    maxWidth: 240,
    minHeight: touchTarget.min,
    paddingVertical: space[3],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[5],
  },
  ctaPillIdle: {
    backgroundColor: colors.primary,
    ...elevation.level2,
  },
  ctaPillRunning: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  ctaIcon: {
    marginRight: space[2],
  },
  ctaText: {
    flexShrink: 1,
    letterSpacing: 0.2,
  },
});
