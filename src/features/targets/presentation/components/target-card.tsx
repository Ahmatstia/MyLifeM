import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ArrowUpRight, Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Card, AppText, ProgressBar } from '@/shared/ui';
import type { TargetEntity } from '../../domain/entities/target.entity';

export interface TargetCardProps { target: TargetEntity; onPress: () => void; style?: StyleProp<ViewStyle>; }
export const TargetCard: React.FC<TargetCardProps> = ({ target, onPress, style }) => (
  <Card variant="elevated" onPress={onPress} padding={space[5]} style={[styles.card, style]}>
    <View style={styles.top}>
      <AppText variant="labelMedium" color="onPrimaryContainer" style={styles.category}>{target.categoryName || 'Umum'}</AppText>
      <ArrowUpRight size={20} color={colors.primary} />
    </View>
    <AppText variant="headlineSmall" style={styles.title} numberOfLines={3}>{target.title}</AppText>
    {target.description && <AppText variant="bodyMedium" color="onSurfaceVariant" numberOfLines={2} style={styles.description}>{target.description}</AppText>}
    <View style={styles.metric}>
      <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.label}>{target.totalTasks > 0 ? target.completedTasks + ' / ' + target.totalTasks + ' tugas rencana' : 'Belum ada tugas rencana'}</AppText>
      <AppText variant="titleMedium" color="primary" tabularNums>{target.progressPercent}%</AppText>
    </View>
    <ProgressBar progress={target.progressPercent} height={6} />
    {target.status === 'COMPLETED' && <View style={styles.completed}><Check size={16} color={colors.success} /><AppText variant="labelMedium" color="success">Target selesai</AppText></View>}
  </Card>
);
const styles = StyleSheet.create({
  card: { marginBottom: space[4] },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  category: { backgroundColor: colors.primaryContainer, paddingHorizontal: space[3], paddingVertical: space[1], borderRadius: radius.sm, flexShrink: 1 },
  title: { marginTop: space[4], marginBottom: space[2] },
  description: { marginBottom: space[3] },
  metric: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3], marginVertical: space[3] },
  label: { flex: 1 },
  completed: { flexDirection: 'row', gap: space[2], marginTop: space[3], alignItems: 'center' },
});
