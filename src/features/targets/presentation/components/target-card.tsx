import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Check, Pause, Flag } from 'lucide-react-native';
import { radius, space, touchTarget } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText, ProgressBar } from '@/shared/ui';
import type { TargetEntity } from '../../domain/entities/target.entity';

export interface TargetCardProps {
  target: TargetEntity;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TargetCard: React.FC<TargetCardProps> = ({ target, onPress, style }) => {
  const progress = Math.min(100, Math.max(0, target.progressPercent || 0));
  const done = target.status === 'COMPLETED';
  const paused = target.status === 'PAUSED';
  const StatusIcon = done ? Check : paused ? Pause : Flag;
  const status = done ? 'Tercapai' : paused ? 'Dijeda' : target.priority === 'HIGH' ? 'Prioritas utama' : 'Dalam proses';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Buka detail target ${target.title}`}
      accessibilityHint={`${status}. ${progress} persen selesai.`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
    >
      <View style={styles.labels}>
        <AppText variant="labelMedium" color="onSurfaceVariant">{target.categoryName || 'Umum'}</AppText>
        <View style={styles.status}>
          <StatusIcon size={space[4]} color={colors.primary} />
          <AppText variant="labelMedium" color="primary">{status}</AppText>
        </View>
      </View>
      <AppText variant="headlineSmall">{target.title}</AppText>
      {target.description ? (
        <AppText variant="bodyMedium" color="onSurfaceVariant" numberOfLines={2}>{target.description}</AppText>
      ) : null}
      <View style={styles.metrics}>
        <AppText variant="bodyMedium" color="onSurfaceVariant" tabularNums>
          {target.totalTasks ? `${target.completedTasks}/${target.totalTasks} tugas selesai` : 'Belum ada rencana'}
        </AppText>
        {target.totalEstimatedHours > 0 && (
          <AppText variant="labelMedium" color="onSurfaceVariant">{target.totalEstimatedHours} jam estimasi</AppText>
        )}
      </View>
      {target.totalTasks > 0 && <ProgressBar progress={progress} height={space[1]} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: space[2],
    minHeight: touchTarget.min,
    paddingVertical: space[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  pressed: { backgroundColor: colors.surfaceContainerLow, borderRadius: radius.sm },
  labels: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: space[2] },
  status: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  metrics: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', justifyContent: 'space-between', gap: space[2] },
});
