import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
  ScrollView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronUp,
  Check,
  Target,
  Flame,
  Volume2,
  CloudRain,
  Coffee,
  Wind,
  Trees,
} from 'lucide-react-native';
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

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Lo-Fi Rain', icon: CloudRain },
  { id: 'cafe', label: 'Suasana Kafe', icon: Coffee },
  { id: 'white', label: 'White Noise', icon: Wind },
  { id: 'forest', label: 'Hutan Tenang', icon: Trees },
];

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

  const [activeSound, setActiveSound] = useState<string>('rain');

  // Circular gauge dimension
  const circleSize = 180;
  const strokeWidth = 10;
  const radiusVal = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusVal;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progressRatio, 0), 1));

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
              numberOfLines={1}
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

      {/* 2. Central Countdown Ring */}
      <View style={styles.orbitDisplayCard}>
        <View style={styles.circleSvgWrapper}>
          <Svg width={circleSize} height={circleSize} style={styles.svgRotate}>
            {/* Background track */}
            <Circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radiusVal}
              stroke="#EFECFF"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Arc */}
            {mode !== 'STOPWATCH' && (
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radiusVal}
                stroke={isRunning ? '#E8A838' : '#E06B52'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </Svg>

          {/* Inner Display Console */}
          <View style={styles.orbitInnerContent}>
            <AppText
              variant="timer"
              align="center"
              tabularNums
              style={[styles.timerDigits, { fontSize: digitSize }]}
            >
              {formattedTime}
            </AppText>
            <AppText variant="bodySmall" style={styles.timerSubtitle}>
              {isRunning ? 'Konsentrasi penuh' : 'Tetap tenang dan fokus'}
            </AppText>
          </View>
        </View>

        {/* Pomodoro Interval Indicator */}
        <View style={styles.cycleBadge}>
          <Flame size={14} color="#E06B52" />
          <AppText variant="labelSmall" style={styles.cycleBadgeText}>
            Interval Pomodoro
          </AppText>
          <View style={styles.cycleDotsRow}>
            <View style={[styles.cycleDot, styles.cycleDotActive]} />
            <View style={[styles.cycleDot, isRunning && styles.cycleDotActive]} />
            <View style={styles.cycleDot} />
            <View style={styles.cycleDot} />
          </View>
        </View>
      </View>

      {/* 3. Session Mode Selector */}
      <View style={styles.modeSection}>
        <View style={styles.modeCardsRow}>
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
              {`Pomodoro ${hasSession && mode === 'POMODORO' ? selectedMinutes : preferences.pomodoroMinutes}m`}
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
              {`Deep Flow ${hasSession && mode === 'DEEP_FLOW' ? selectedMinutes : preferences.deepFlowMinutes}m`}
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
        <View style={styles.secondaryActionsRow}>
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

      {/* 5. Ambient Focus Audio Selector */}
      <View style={styles.soundSection}>
        <View style={styles.soundHeaderRow}>
          <View style={styles.soundTitleWithIcon}>
            <Volume2 size={16} color="#1E1E2E" />
            <AppText variant="labelMedium" style={styles.soundSectionTitle}>
              Suara Latar Fokus
            </AppText>
          </View>
          <AppText variant="bodySmall" style={styles.soundSectionSub}>
            Ambience Tenang
          </AppText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.soundScrollContent}
        >
          {AMBIENT_SOUNDS.map((sound) => {
            const Icon = sound.icon;
            const isSelected = activeSound === sound.id;
            return (
              <Pressable
                key={sound.id}
                onPress={() => setActiveSound(sound.id)}
                accessibilityRole="button"
                accessibilityLabel={sound.label}
                style={[
                  styles.soundPill,
                  isSelected && styles.soundPillActive,
                ]}
              >
                <Icon
                  size={15}
                  color={isSelected ? '#1E1E2E' : '#504535'}
                />
                <AppText
                  variant="labelSmall"
                  style={[
                    styles.soundPillText,
                    isSelected && styles.soundPillTextActive,
                  ]}
                >
                  {sound.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FAF5EB',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: space[4],
    marginBottom: space[4],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  activeTaskStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: space[3],
    marginBottom: space[3],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  activeTaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    flex: 1,
  },
  targetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFDDAF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  stripSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFECFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDisplayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    paddingVertical: space[4],
    paddingHorizontal: space[3],
    marginBottom: space[3],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  circleSvgWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  orbitInnerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
  },
  timerDigits: {
    fontFamily: fontFamily.bold,
    color: '#1E1E2E',
    letterSpacing: -1,
  },
  timerSubtitle: {
    fontSize: 11,
    color: '#504535',
    marginTop: 2,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFECFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    paddingHorizontal: space[3],
    paddingVertical: 5,
    borderRadius: 9999,
    marginTop: space[3],
  },
  cycleBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#1E1E2E',
  },
  cycleDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  cycleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DAD8EE',
  },
  cycleDotActive: {
    backgroundColor: '#E8A838',
  },
  modeSection: {
    marginBottom: space[3],
  },
  modeCardsRow: {
    flexDirection: 'row',
    gap: space[2],
    marginBottom: space[1],
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    borderRadius: 14,
    paddingVertical: space[2],
    paddingHorizontal: 4,
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  modeCardActive: {
    backgroundColor: '#FFDDAF',
    shadowOffset: { width: 1, height: 1 },
  },
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
  controlsSection: {
    gap: space[2],
    marginBottom: space[3],
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    paddingVertical: space[3],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E1E2E',
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  mainActionIdle: {
    backgroundColor: '#E8A838',
  },
  mainActionRunning: {
    backgroundColor: '#E06B52',
  },
  mainActionButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: '#1E1E2E',
    letterSpacing: 0.3,
  },
  buttonPressed: {
    transform: [{ translate: [2, 2] }],
    shadowOffset: { width: 0, height: 0 },
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#BFEECC',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    borderRadius: 12,
    paddingVertical: space[2],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  finishBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    borderRadius: 12,
    paddingVertical: space[2],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  resetBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  soundSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: space[3],
    shadowColor: '#1E1E2E',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  soundHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  soundTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soundSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#1E1E2E',
  },
  soundSectionSub: {
    fontSize: 11,
    color: '#504535',
  },
  soundScrollContent: {
    flexDirection: 'row',
    gap: space[2],
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  soundPillActive: {
    backgroundColor: '#FFDAD3',
  },
  soundPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#504535',
  },
  soundPillTextActive: {
    color: '#1E1E2E',
  },
});
