import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ArrowUpRight, Check } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui';
import type { TargetEntity } from '../../domain/entities/target.entity';

const s = colors.sprout;
export interface TargetCardProps {
  target: TargetEntity;
  onPress: () => void;
  index?: number;
  isLast?: boolean;
  style?: StyleProp<ViewStyle>;
}
const accents = [s.forest, s.grape, '#995126', s.teal];

export const TargetCard: React.FC<TargetCardProps> = ({ target, onPress, index = 0, style }) => {
  const done = target.status === 'COMPLETED';
  const progress = Math.min(100, Math.max(0, target.progressPercent || 0));
  const accent = accents[index % accents.length];
  const status = done ? 'Tercapai' : target.status === 'PAUSED' ? 'Dijeda' : target.priority === 'HIGH' ? 'Prioritas utama' : 'Dalam proses';
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      accessibilityLabel={`Buka detail target ${target.title}`}
      style={({ pressed }) => [styles.sheet, { borderLeftColor: accent }, pressed && { opacity: 0.8 }, style]}>
      <View style={styles.topRow}>
        <AppText style={[styles.index, { color: accent }]}>{String(index + 1).padStart(2, '0')}</AppText>
        <AppText style={styles.category}>{target.categoryName || 'Umum'}</AppText>
        {done ? <Check size={17} color={accent} /> : <ArrowUpRight size={17} color={accent} />}
      </View>
      <AppText style={styles.title}>{target.title}</AppText>
      {target.description ? <AppText style={styles.description} numberOfLines={2}>{target.description}</AppText> : null}
      <View style={styles.bottomRow}>
        <AppText style={[styles.status, { color: accent }]}>{status}</AppText>
        <AppText style={styles.metric} tabularNums>{progress}%</AppText>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${progress}%`, backgroundColor: accent }]} /></View>
      <View style={styles.bottomRow}>
        <AppText style={styles.caption}>{target.totalTasks > 0 ? `${target.completedTasks}/${target.totalTasks} langkah selesai` : 'Belum ada rencana'}</AppText>
        {target.totalEstimatedHours > 0 && <AppText style={styles.caption}>{target.totalEstimatedHours}j estimasi</AppText>}
      </View>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  sheet: { padding: 14, backgroundColor: s.card, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3, borderRadius: 12, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  index: { fontFamily: fontFamily.bold, fontSize: 11, letterSpacing: 1 },
  category: { flex: 1, fontSize: 11, color: s.inkMuted },
  title: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 23, letterSpacing: -0.3, color: s.ink },
  description: { fontSize: 12, lineHeight: 18, color: s.inkMuted },
  bottomRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  status: { fontFamily: fontFamily.semibold, fontSize: 11 },
  metric: { fontFamily: fontFamily.bold, fontSize: 13, color: s.ink },
  track: { height: 3, backgroundColor: s.creamDeep, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%' },
  caption: { fontSize: 11, color: s.inkMuted },
});
