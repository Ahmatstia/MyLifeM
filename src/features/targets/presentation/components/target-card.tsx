import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Plus, Check, Calendar, Flag } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import { ProgressBar } from '@/shared/ui/progress-bar';
import {
  calculateTargetProgress,
  type TargetEntity,
  type LifePillarEntity,
} from '../../domain/entities/target.entity';

export interface TargetCardProps {
  target: TargetEntity;
  pillar?: LifePillarEntity;
  onPress?: () => void;
  onIncrement?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TargetCard: React.FC<TargetCardProps> = ({
  target,
  pillar,
  onPress,
  onIncrement,
  style,
}) => {
  const progressPercent = calculateTargetProgress(target);
  const pillarColor = pillar?.color || colors.primary;
  const isCompleted = target.status === 'COMPLETED' || progressPercent >= 100;

  // Format deadline if present
  let deadlineText: string | null = null;
  if (target.targetDate) {
    try {
      const d = new Date(target.targetDate);
      deadlineText = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      deadlineText = target.targetDate;
    }
  }

  return (
    <Card
      variant={isCompleted ? 'filled' : 'elevated'}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Header: Pillar Badge & Priority */}
      <View style={styles.headerRow}>
        <View style={styles.pillarBadge}>
          <View style={[styles.pillarDot, { backgroundColor: pillarColor }]} />
          <AppText variant="labelSmall" style={{ color: pillarColor }}>
            {pillar?.name || 'Target Hidup'}
          </AppText>
        </View>

        <View style={styles.priorityRow}>
          <Flag size={12} color={colors.onSurfaceSubtle} />
          <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.priorityText}>
            {target.priority}
          </AppText>
        </View>
      </View>

      {/* Target Title & Description */}
      <AppText
        variant="titleMedium"
        color={isCompleted ? 'onSurfaceVariant' : 'onSurface'}
        numberOfLines={2}
        style={[styles.title, isCompleted && styles.completedText]}
      >
        {target.title}
      </AppText>

      {target.description ? (
        <AppText
          variant="bodySmall"
          color="onSurfaceSubtle"
          numberOfLines={2}
          style={styles.description}
        >
          {target.description}
        </AppText>
      ) : null}

      {/* Progress Metric Info */}
      <View style={styles.metricRow}>
        <AppText variant="bodySmall" color="onSurfaceVariant" tabularNums>
          {target.type === 'NUMERIC'
            ? `${target.currentValue} / ${target.targetValue} ${target.unit}`
            : `${progressPercent}% Selesai`}
        </AppText>

        <AppText
          variant="labelMedium"
          style={{ color: isCompleted ? colors.success : pillarColor }}
          tabularNums
        >
          {progressPercent}%
        </AppText>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={progressPercent}
        color={isCompleted ? colors.success : pillarColor}
        height={8}
        style={styles.progressBar}
      />

      {/* Footer: Due date & Quick Increment Button */}
      <View style={styles.footerRow}>
        {deadlineText ? (
          <View style={styles.deadlineContainer}>
            <Calendar size={13} color={colors.onSurfaceSubtle} />
            <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.deadlineLabel}>
              {deadlineText}
            </AppText>
          </View>
        ) : (
          <View />
        )}

        {/* Quick Increment Action */}
        {!isCompleted && onIncrement && (
          <Pressable
            onPress={onIncrement}
            accessibilityRole="button"
            accessibilityLabel={`Tambah progres ${target.title}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.incrementButton}
          >
            <Plus size={16} color={colors.primary} />
            <AppText variant="labelSmall" color="primary" style={styles.incrementText}>
              +1 {target.unit !== '%' ? target.unit : ''}
            </AppText>
          </Pressable>
        )}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={14} color={colors.success} />
            <AppText variant="labelSmall" color="success" style={styles.completedLabel}>
              Tercapai
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: space[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  pillarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: space[1],
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  title: {
    marginBottom: space[1],
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  description: {
    marginBottom: space[3],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
    marginTop: space[1],
  },
  progressBar: {
    marginBottom: space[3],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineLabel: {
    marginLeft: 4,
  },
  incrementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    minHeight: 32,
  },
  incrementText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedLabel: {
    fontWeight: '600',
  },
});
