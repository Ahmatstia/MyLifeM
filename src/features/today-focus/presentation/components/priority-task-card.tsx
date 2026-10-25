import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Check, Play, MoreHorizontal } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, elevation } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import type { DailyFocusItemEntity } from '../../domain/entities/daily-focus.entity';

export interface PriorityTaskCardProps {
  item: DailyFocusItemEntity;
  isActiveTimerTask?: boolean;
  onToggleComplete: () => void;
  onStartFocus: () => void;
  onRemove: () => void;
  style?: ViewStyle;
}

/**
 * PriorityTaskCard: Desain Cute Marshmallow Minimal.
 * - Tanpa tumpukan icon (jam, trash, dsb).
 * - Checkbox bundar 30dp yang empuk dan memuaskan saat ditekan.
 * - Pil pastel lembut untuk estimasi waktu & status pilar.
 */
export const PriorityTaskCard: React.FC<PriorityTaskCardProps> = ({
  item,
  isActiveTimerTask = false,
  onToggleComplete,
  onStartFocus,
  onRemove,
  style,
}) => {
  const { task, isCompleted } = item;

  return (
    <Card
      variant={isActiveTimerTask ? 'highlight' : isCompleted ? 'filled' : 'elevated'}
      padding={space[4]}
      style={[styles.container, style]}
    >
      <View style={styles.mainRow}>
        {/* Checkbox Bundar Tactile (Minimal 48dp hit-box) */}
        <Pressable
          onPress={onToggleComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`Tandai ${task.title} ${isCompleted ? 'belum selesai' : 'selesai'}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.checkTouchArea}
        >
          <View style={[styles.stampCircle, isCompleted && styles.stampCircleDone]}>
            {isCompleted && <Check size={16} color={colors.onPrimary} strokeWidth={3} />}
          </View>
        </Pressable>

        {/* Info Tugas */}
        <View style={styles.textContainer}>
          <AppText
            variant="titleMedium"
            color={isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
            numberOfLines={2}
            style={[styles.taskTitle, isCompleted && styles.completedText]}
          >
            {task.title}
          </AppText>

          {/* Pil Pastel Minimalis: Tanpa Ikon Jam */}
          <View style={styles.pillRow}>
            <View style={styles.tagPill}>
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums>
                {task.estimatedMinutes} mnt
              </AppText>
            </View>

            {task.priority !== 'MEDIUM' && (
              <View
                style={[
                  styles.priorityPill,
                  task.priority === 'HIGH' ? styles.priorityHigh : styles.priorityLow,
                ]}
              >
                <AppText
                  variant="labelSmall"
                  style={{
                    color: task.priority === 'HIGH' ? colors.secondary : colors.onSurfaceVariant,
                  }}
                >
                  {task.priority === 'HIGH' ? 'Penting' : 'Santai'}
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Aksi Sisi Kanan: Mulai Fokus / Hapus Bersih */}
        <View style={styles.actionsBox}>
          {!isCompleted ? (
            <Pressable
              onPress={onStartFocus}
              accessibilityRole="button"
              accessibilityLabel={`Fokus pada ${task.title}`}
              style={({ pressed }) => [
                styles.focusPill,
                isActiveTimerTask ? styles.focusPillActive : styles.focusPillIdle,
                pressed && styles.pressed,
              ]}
            >
              <Play
                size={13}
                color={isActiveTimerTask ? colors.onPrimary : colors.primary}
                fill={isActiveTimerTask ? colors.onPrimary : colors.primary}
              />
              <AppText
                variant="labelSmall"
                color={isActiveTimerTask ? 'onPrimary' : 'primary'}
                style={styles.focusPillText}
              >
                {isActiveTimerTask ? 'Aktif' : 'Fokus'}
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.donePill}>
              <AppText variant="labelSmall" color="success">
                Selesai
              </AppText>
            </View>
          )}

          {/* Opsi Lepas dari Hari Ini (Diskrit, tidak mengotori layar) */}
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Lepas tugas ini dari prioritas hari ini"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.moreBtn}
          >
            <MoreHorizontal size={18} color={colors.onSurfaceSubtle} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: space[3],
    borderRadius: radius.xl,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkTouchArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[2],
  },
  stampCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: '#D4CEF2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCircleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textContainer: {
    flex: 1,
    paddingRight: space[2],
  },
  taskTitle: {
    marginBottom: 4,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  tagPill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  priorityPill: {
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  priorityHigh: {
    backgroundColor: colors.secondaryContainer,
  },
  priorityLow: {
    backgroundColor: colors.surfaceContainerLow,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    gap: 4,
  },
  focusPillIdle: {
    backgroundColor: colors.primaryContainer,
  },
  focusPillActive: {
    backgroundColor: colors.primary,
    ...elevation.level1,
  },
  focusPillText: {
    letterSpacing: 0.2,
  },
  donePill: {
    backgroundColor: colors.successContainer,
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  moreBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
