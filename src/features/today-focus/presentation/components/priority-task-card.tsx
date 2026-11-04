import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, Play, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { Card, AppText } from '@/shared/ui';
import type { DailyFocusItemEntity } from '../../domain/entities/daily-focus.entity';

export interface PriorityTaskCardProps {
  item: DailyFocusItemEntity;
  isActiveTimerTask?: boolean;
  onToggleComplete: () => void;
  onStartFocus: () => void;
  onRemove: () => void;
  style?: ViewStyle;
}

export const PriorityTaskCard: React.FC<PriorityTaskCardProps> = ({
  item,
  isActiveTimerTask = false,
  onToggleComplete,
  onStartFocus,
  onRemove,
  style,
}) => {
  const { task, isCompleted } = item;
  const cancelled = task.status === 'CANCELLED';

  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics fallback
    }
    onToggleComplete();
  };

  return (
    <Card
      variant={isActiveTimerTask ? 'highlight' : 'elevated'}
      padding={space[4]}
      style={[
        styles.card,
        isActiveTimerTask && styles.cardActiveTimer,
        style,
      ]}
    >
      <View style={styles.mainRow}>
        {/* Chunky Tactile Checkbox */}
        <Pressable
          onPress={handleToggle}
          accessibilityRole="checkbox"
          aria-checked={isCompleted}
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={(isCompleted || cancelled ? 'Buka kembali ' : 'Selesaikan ') + task.title}
          style={styles.checkTouch}
        >
          <View
            style={[
              styles.checkbox,
              isCompleted && styles.checkboxCompleted,
              cancelled && styles.checkboxCancelled,
            ]}
          >
            {isCompleted && <Check size={16} color={colors.onPrimary} strokeWidth={2.6} />}
          </View>
        </Pressable>

        {/* Task Details */}
        <View style={styles.content}>
          <AppText
            variant="titleMedium"
            style={[
              styles.taskTitle,
              isCompleted && styles.textCompleted,
              cancelled && styles.textCancelled,
            ]}
          >
            {task.title}
          </AppText>

          <View style={styles.metaRow}>
            {/* Duration pill */}
            <View style={styles.metaPill}>
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums>
                {task.estimatedMinutes} mnt
              </AppText>
            </View>

            {/* High Priority badge */}
            {(task.priority === 'HIGH' || task.priority === 'URGENT') && (
              <View style={[styles.metaPill, styles.highPriorityPill]}>
                <AppText variant="labelSmall" style={styles.highPriorityText}>
                  Prioritas
                </AppText>
              </View>
            )}

            {cancelled && (
              <View style={[styles.metaPill, styles.cancelledPill]}>
                <AppText variant="labelSmall" style={styles.cancelledText}>
                  Dibatalkan
                </AppText>
              </View>
            )}

            {isCompleted && (
              <View style={[styles.metaPill, styles.completedPill]}>
                <AppText variant="labelSmall" style={styles.completedText}>
                  Selesai
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Right Actions: Play Timer & Remove */}
        <View style={styles.actions}>
          {!isCompleted && !cancelled && (
            <Pressable
              onPress={onStartFocus}
              accessibilityRole="button"
              accessibilityLabel={'Mulai fokus ' + task.title}
              style={[
                styles.actionBtn,
                isActiveTimerTask ? styles.activePlayBtn : styles.normalPlayBtn,
              ]}
            >
              <Play
                size={16}
                color={isActiveTimerTask ? colors.bento.textLight : colors.bento.obsidian}
                fill={isActiveTimerTask ? colors.bento.textLight : 'transparent'}
              />
            </Pressable>
          )}

          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={'Hapus dari hari ini ' + task.title}
            style={styles.removeTouch}
          >
            <X size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: space[3],
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActiveTimer: {
    borderColor: colors.bento.lilac,
    backgroundColor: colors.bento.lilacSoft,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  checkTouch: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
  checkboxCompleted: {
    borderColor: colors.bento.mint,
    backgroundColor: colors.bento.mint,
  },
  checkboxCancelled: {
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: fontFamily.semibold,
    color: colors.onSurface,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: colors.onSurfaceVariant,
  },
  textCancelled: {
    textDecorationLine: 'line-through',
    color: colors.error,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  highPriorityPill: {
    backgroundColor: colors.bento.coralSoft,
  },
  highPriorityText: {
    color: colors.bento.coral,
    fontFamily: fontFamily.semibold,
  },
  cancelledPill: {
    backgroundColor: colors.errorContainer,
  },
  cancelledText: {
    color: colors.error,
    fontFamily: fontFamily.semibold,
  },
  completedPill: {
    backgroundColor: colors.bento.mintSoft,
  },
  completedText: {
    color: colors.bento.mint,
    fontFamily: fontFamily.semibold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalPlayBtn: {
    backgroundColor: colors.bento.pillBorder,
  },
  activePlayBtn: {
    backgroundColor: colors.bento.obsidian,
  },
  removeTouch: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
