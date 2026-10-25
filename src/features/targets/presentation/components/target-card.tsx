import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import { ProgressBar } from '@/shared/ui/progress-bar';
import type { TargetEntity } from '../../domain/entities/target.entity';

export interface TargetCardProps {
  target: TargetEntity;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * TargetCard: Desain Cute Marshmallow Minimal sesuai PRD 14.
 * - Nama Target
 * - Nama Kategori
 * - Persentase progres
 * - Jumlah tugas selesai dan total tugas
 */
export const TargetCard: React.FC<TargetCardProps> = ({
  target,
  onPress,
  style,
}) => {
  const isCompleted = target.progressPercent >= 100 && target.totalTasks > 0;

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      padding={space[4]}
      style={[styles.card, style]}
    >
      {/* Header: Kategori Pill & Status */}
      <View style={styles.headerRow}>
        <View style={styles.categoryPill}>
          <AppText variant="labelSmall" color="primary">
            {target.categoryName || 'Umum'}
          </AppText>
        </View>

        {isCompleted && (
          <View style={styles.completedPill}>
            <Check size={12} color={colors.success} strokeWidth={3} />
            <AppText variant="labelSmall" color="success">
              Selesai
            </AppText>
          </View>
        )}
      </View>

      {/* Judul & Deskripsi */}
      <AppText
        variant="titleMedium"
        color="onSurface"
        numberOfLines={2}
        style={styles.title}
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

      {/* Metric Row: Tugas selesai & Persentase */}
      <View style={styles.metricRow}>
        <AppText variant="bodySmall" color="onSurfaceVariant" tabularNums>
          {target.totalTasks === 0
            ? 'Belum ada tugas'
            : `${target.completedTasks}/${target.totalTasks} tugas selesai`}
        </AppText>

        <View style={styles.percentPill}>
          <AppText
            variant="labelSmall"
            color={isCompleted ? 'success' : 'primary'}
            tabularNums
          >
            {target.progressPercent}%
          </AppText>
        </View>
      </View>

      {/* Chubby Progress Bar */}
      <ProgressBar
        progress={target.progressPercent}
        color={isCompleted ? colors.success : colors.primary}
        height={8}
        style={styles.progressBar}
      />
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
  categoryPill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successContainer,
    paddingVertical: 3,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    gap: 4,
  },
  title: {
    lineHeight: 22,
    marginBottom: 4,
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
});
