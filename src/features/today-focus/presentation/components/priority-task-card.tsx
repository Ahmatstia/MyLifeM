import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Check, Play, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Card, AppText } from '@/shared/ui';
import type { DailyFocusItemEntity } from '../../domain/entities/daily-focus.entity';

export interface PriorityTaskCardProps {
  item: DailyFocusItemEntity; isActiveTimerTask?: boolean; onToggleComplete: () => void;
  onStartFocus: () => void; onRemove: () => void; style?: ViewStyle;
}
export const PriorityTaskCard: React.FC<PriorityTaskCardProps> = ({
  item, isActiveTimerTask = false, onToggleComplete, onStartFocus, onRemove, style,
}) => {
  const { task, isCompleted } = item;
  return (
    <Card variant={isActiveTimerTask ? 'highlight' : 'elevated'} padding={space[3]} style={[styles.card, style]}>
      <View style={styles.row}>
        <Pressable onPress={onToggleComplete} accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }} accessibilityLabel={(isCompleted ? 'Buka kembali ' : 'Selesaikan ') + task.title} style={styles.touch}>
          <View style={[styles.checkbox, isCompleted && styles.checked]}>{isCompleted && <Check size={16} color={colors.onPrimary} />}</View>
        </Pressable>
        <View style={styles.text}>
          <AppText variant="titleSmall" style={isCompleted ? styles.completed : undefined}>{task.title}</AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">{task.estimatedMinutes} menit{task.priority === 'HIGH' || task.priority === 'URGENT' ? ' · Prioritas tinggi' : ''}{isCompleted ? ' · Selesai' : ''}</AppText>
        </View>
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={'Lepas ' + task.title + ' dari prioritas hari ini'} style={styles.touch}>
          <X size={18} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
      {!isCompleted && <Pressable onPress={onStartFocus} accessibilityRole="button"
        accessibilityLabel={'Buka sesi fokus untuk ' + task.title} style={styles.focus}>
        <Play size={16} color={colors.primary} />
        <AppText variant="labelMedium" color="primary">{isActiveTimerTask ? 'Lihat sesi fokus' : 'Fokus pada tugas ini'}</AppText>
      </Pressable>}
    </Card>
  );
};
const styles = StyleSheet.create({
  card: { marginBottom: space[3], borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  text: { flex: 1, gap: space[1], paddingTop: space[2] },
  touch: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: radius.xs, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  checked: { borderColor: colors.primary, backgroundColor: colors.primary },
  completed: { textDecorationLine: 'line-through' },
  focus: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: space[2], marginLeft: space[12], paddingVertical: space[2], paddingHorizontal: space[2], flexWrap: 'wrap' },
});
