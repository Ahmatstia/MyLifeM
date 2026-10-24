import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { CheckCircle2, Circle, Play, Trash2, Clock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
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
      padding={space[3]}
      style={[styles.container, style]}
    >
      <View style={styles.row}>
        {/* CheckCircle on LEFT edge with >= 48dp hit area per DESIGN.md 9.2 */}
        <Pressable
          onPress={onToggleComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`Tandai ${task.title} ${isCompleted ? 'belum selesai' : 'selesai'}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.checkButton}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} color={colors.success} />
          ) : (
            <Circle size={24} color={colors.outline} />
          )}
        </Pressable>

        {/* Task Details */}
        <View style={styles.detailsCol}>
          <AppText
            variant="titleSmall"
            color={isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
            numberOfLines={2}
            style={isCompleted ? styles.completedTitle : undefined}
          >
            {task.title}
          </AppText>

          <View style={styles.metaRow}>
            <View style={styles.minutesBadge}>
              <Clock size={12} color={colors.onSurfaceVariant} />
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums style={styles.minutesText}>
                {task.actualMinutes}/{task.estimatedMinutes} mnt
              </AppText>
            </View>

            <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.priorityText}>
              • {task.priority.toLowerCase()}
            </AppText>
          </View>
        </View>

        {/* Action Buttons: Start Focus or Delete */}
        <View style={styles.actionsCol}>
          {!isCompleted && (
            <Pressable
              onPress={onStartFocus}
              accessibilityRole="button"
              accessibilityLabel={`Mulai fokus untuk ${task.title}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.focusButton,
                isActiveTimerTask && styles.activeFocusButton,
              ]}
            >
              <Play
                size={14}
                color={isActiveTimerTask ? colors.onPrimary : colors.primary}
              />
              <AppText
                variant="labelSmall"
                color={isActiveTimerTask ? 'onPrimary' : 'primary'}
                style={styles.focusButtonText}
              >
                {isActiveTimerTask ? 'Aktif' : 'Fokus'}
              </AppText>
            </Pressable>
          )}

          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Hapus dari prioritas hari ini"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.removeButton}
          >
            <Trash2 size={16} color={colors.onSurfaceSubtle} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 72, // ListItem 72 per DESIGN.md
    marginBottom: space[3],
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    width: touchTarget.compact, // 40 with 8dp hitSlop = 48dp
    height: touchTarget.compact,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[2],
  },
  detailsCol: {
    flex: 1,
    marginRight: space[2],
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  minutesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  minutesText: {
    marginLeft: 2,
  },
  priorityText: {
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  activeFocusButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  focusButtonText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  removeButton: {
    padding: space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
