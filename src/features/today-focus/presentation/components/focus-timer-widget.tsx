import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Play, Pause, RotateCcw, Flame, Sparkles, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import type {
  FocusTimerMode,
  TaskEntity,
} from '../../domain/entities/daily-focus.entity';

export interface FocusTimerWidgetProps {
  mode: FocusTimerMode;
  formattedTime: string;
  isRunning: boolean;
  activeTask: TaskEntity | null;
  progressRatio: number;
  onChangeMode: (mode: FocusTimerMode, minutes?: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onClearActiveTask?: () => void;
  style?: ViewStyle;
}

export const FocusTimerWidget: React.FC<FocusTimerWidgetProps> = ({
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
  style,
}) => {
  return (
    <Card variant="highlight" style={[styles.container, style]}>
      {/* Mode Selector Chips */}
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => onChangeMode('POMODORO', 25)}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          style={[
            styles.modeChip,
            mode === 'POMODORO' && styles.modeChipSelected,
          ]}
        >
          <Flame
            size={14}
            color={mode === 'POMODORO' ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <AppText
            variant="labelSmall"
            color={mode === 'POMODORO' ? 'onPrimaryContainer' : 'onSurfaceVariant'}
            style={styles.modeText}
          >
            Pomodoro 25m
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode('DEEP_FLOW', 50)}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          style={[
            styles.modeChip,
            mode === 'DEEP_FLOW' && styles.modeChipSelected,
          ]}
        >
          <Sparkles
            size={14}
            color={mode === 'DEEP_FLOW' ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <AppText
            variant="labelSmall"
            color={mode === 'DEEP_FLOW' ? 'onPrimaryContainer' : 'onSurfaceVariant'}
            style={styles.modeText}
          >
            Deep Flow 50m
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode('STOPWATCH')}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          style={[
            styles.modeChip,
            mode === 'STOPWATCH' && styles.modeChipSelected,
          ]}
        >
          <Clock
            size={14}
            color={mode === 'STOPWATCH' ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <AppText
            variant="labelSmall"
            color={mode === 'STOPWATCH' ? 'onPrimaryContainer' : 'onSurfaceVariant'}
            style={styles.modeText}
          >
            Stopwatch
          </AppText>
        </Pressable>
      </View>

      {/* Active Task Tag */}
      {activeTask ? (
        <View style={styles.activeTaskBadge}>
          <AppText variant="labelSmall" color="primary" numberOfLines={1} style={styles.activeTaskText}>
            Fokus: {activeTask.title}
          </AppText>
          {onClearActiveTask && (
            <Pressable
              onPress={onClearActiveTask}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="labelSmall" color="onSurfaceSubtle">
                [Lepas]
              </AppText>
            </Pressable>
          )}
        </View>
      ) : (
        <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.idleTaskText}>
          Fokus Mandiri (Tanpa Tautan Tugas)
        </AppText>
      )}

      {/* Big Timer Digits */}
      <View style={styles.digitsWrapper}>
        <AppText variant="timer" color="onSurface" align="center" tabularNums>
          {formattedTime}
        </AppText>
      </View>

      {/* Progress Bar indicator */}
      {mode !== 'STOPWATCH' && (
        <ProgressBar
          progress={progressRatio * 100}
          color={isRunning ? colors.primary : colors.surfaceContainerHighest}
          height={6}
          style={styles.progressBar}
        />
      )}

      {/* Timer Controls (min 48dp touch targets) */}
      <View style={styles.controlsRow}>
        {/* Reset Button */}
        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.secondaryButton}
        >
          <RotateCcw size={20} color={colors.onSurfaceVariant} />
        </Pressable>

        {/* Start / Pause Button (CTA filled) */}
        <Button
          title={isRunning ? 'Jeda' : 'Mulai Fokus'}
          variant={isRunning ? 'tonal' : 'filled'}
          size="cta"
          leftIcon={
            isRunning ? (
              <Pause size={20} color={colors.onSurface} />
            ) : (
              <Play size={20} color={colors.onPrimary} />
            )
          }
          onPress={isRunning ? onPause : onStart}
          style={styles.mainCtaButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: space[4],
    marginBottom: space[4],
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[2],
    marginBottom: space[3],
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modeChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  modeText: {
    marginLeft: 4,
  },
  activeTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: space[2],
    maxWidth: '90%',
    gap: space[2],
  },
  activeTaskText: {
    fontWeight: '600',
    flexShrink: 1,
  },
  idleTaskText: {
    textAlign: 'center',
    marginBottom: space[2],
  },
  digitsWrapper: {
    paddingVertical: space[2],
    alignItems: 'center',
    justifyContent: 'center',
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
  secondaryButton: {
    width: touchTarget.min, // 48
    height: touchTarget.min, // 48
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCtaButton: {
    flex: 1,
    maxWidth: 220,
  },
});
