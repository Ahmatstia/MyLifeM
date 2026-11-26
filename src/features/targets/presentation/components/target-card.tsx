import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Check, Pause, Flag, Ban, FolderOpen } from 'lucide-react-native';
import { fontFamily, radius, space, touchTarget } from '@/theme/tokens';
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
  const cancelled = target.status === 'CANCELLED';
  const StatusIcon = done ? Check : cancelled ? Ban : paused ? Pause : Flag;
  const status = done ? 'Tercapai' : cancelled ? 'Dibatalkan' : paused ? 'Dijeda' : target.priority === 'HIGH' ? 'Prioritas utama' : 'Dalam proses';
  const paper = target.categoryId === 'cat-olahraga' ? colors.folderMint
    : target.categoryId === 'cat-karier' ? colors.folderPeach : colors.folderLilac;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Buka detail target ${target.title}`}
      accessibilityHint={`${status}. ${progress} persen selesai.`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
    >
      <View style={styles.labels}>
        <View style={styles.tabWrap}>
          <View style={[styles.tab, { backgroundColor: paper }]}>
            <FolderOpen size={space[4]} color={colors.primary} />
            <AppText variant="labelMedium" color="primary">{target.categoryName || 'Umum'}</AppText>
          </View>
          <View style={[styles.tabSlope, { borderBottomColor: paper }]} />
        </View>
        <View style={styles.status}>
          <StatusIcon size={space[4]} color={colors.primary} />
          <AppText variant="labelMedium" color="primary">{status}</AppText>
        </View>
      </View>
      <View style={[styles.cover, { backgroundColor: paper }]}>
        <AppText variant="headlineSmall" style={styles.name}>{target.title}</AppText>
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
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { minHeight: touchTarget.min },
  pressed: { opacity: 0.83 },
  labels: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' },
  tabWrap: { maxWidth: '100%', flexDirection: 'row', alignItems: 'flex-end' },
  tab: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: space[2], paddingLeft: space[4], paddingRight: space[2], paddingTop: space[2], paddingBottom: space[1], borderTopLeftRadius: radius.md, borderTopRightRadius: radius.xs },
  tabSlope: { borderBottomWidth: space[5], borderRightWidth: space[4], borderRightColor: 'transparent' },
  cover: { gap: space[1], padding: space[4], borderTopRightRadius: radius.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  name: { fontFamily: fontFamily.display, color: colors.onSurface },
  status: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  metrics: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', justifyContent: 'space-between', gap: space[2] },
});
