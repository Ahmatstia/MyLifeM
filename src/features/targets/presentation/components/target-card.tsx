import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Plus, Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
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

/**
 * TargetCard: Desain Cute Marshmallow Minimal.
 * - Tanpa ikon flag/calendar yang berantakan.
 * - Pil kategori pastel bertekstur halus.
 * - Tombol increment +1 empuk.
 */
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

  // Format deadline sederhana tanpa ikon berlebih
  let deadlineText: string | null = null;
  if (target.targetDate) {
    try {
      const d = new Date(target.targetDate);
      deadlineText = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      deadlineText = target.targetDate;
    }
  }

  return (
    <Card
      variant={isCompleted ? 'filled' : 'elevated'}
      onPress={onPress}
      padding={space[4]}
      style={[styles.card, style]}
    >
      {/* Header: Pil Kategori Pilar & Prioritas */}
      <View style={styles.headerRow}>
        <View style={[styles.pillarPill, { backgroundColor: colors.primaryContainer }]}>
          <View style={[styles.pillarDot, { backgroundColor: pillarColor }]} />
          <AppText variant="labelSmall" style={{ color: pillarColor }}>
            {pillar?.name || 'Target Hidup'}
          </AppText>
        </View>

        {deadlineText && (
          <View style={styles.deadlinePill}>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Sampai {deadlineText}
            </AppText>
          </View>
        )}
      </View>

      {/* Judul & Deskripsi */}
      <AppText
        variant="titleMedium"
        color={isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
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
            : `${progressPercent}% selesai`}
        </AppText>

        <View style={styles.percentPill}>
          <AppText
            variant="labelSmall"
            style={{ color: isCompleted ? colors.success : colors.primary }}
            tabularNums
          >
            {progressPercent}%
          </AppText>
        </View>
      </View>

      {/* Chubby Progress Bar */}
      <ProgressBar
        progress={progressPercent}
        color={isCompleted ? colors.success : colors.primary}
        height={8}
        style={styles.progressBar}
      />

      {/* Footer: Quick Increment Action */}
      {!isCompleted && onIncrement && (
        <View style={styles.footerRow}>
          <Pressable
            onPress={onIncrement}
            accessibilityRole="button"
            accessibilityLabel={`Tambah progres ${target.title}`}
            style={({ pressed }) => [styles.incrementPill, pressed && styles.pressed]}
          >
            <Plus size={14} color={colors.primary} />
            <AppText variant="labelSmall" color="primary" style={styles.incrementText}>
              +1 {target.unit !== '%' ? target.unit : ''}
            </AppText>
          </Pressable>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedBadgeRow}>
          <View style={styles.completedPill}>
            <Check size={13} color={colors.success} strokeWidth={3} />
            <AppText variant="labelSmall" color="success">
              Tercapai
            </AppText>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: space[3],
    borderRadius: radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  pillarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  pillarDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    marginRight: space[2],
  },
  deadlinePill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 3,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  title: {
    lineHeight: 22,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    lineHeight: 18,
    marginBottom: space[2],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[2],
    marginBottom: space[2],
  },
  percentPill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  progressBar: {
    marginVertical: space[1],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: space[3],
  },
  incrementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 6,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    gap: 4,
  },
  incrementText: {
    letterSpacing: 0.2,
  },
  completedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: space[2],
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successContainer,
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    gap: 4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
