import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions, type ViewStyle, type StyleProp } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui';
import type { AgendaEventEntity, AgendaEventType } from '../../domain/entities/agenda.entity';

export interface TimelineEventCardProps {
  event: AgendaEventEntity; onToggleComplete: () => void; onDelete: () => void; style?: StyleProp<ViewStyle>;
}
const LABELS: Record<AgendaEventType, string> = { WORK: 'Kerja', PERSONAL: 'Pribadi', LEARNING: 'Belajar', MEETING: 'Rapat' };
const formatTime = (value: string) => new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, onToggleComplete, onDelete, style }) => {
  const { fontScale } = useWindowDimensions();
  return (
  <View style={[styles.row, style]}>
    {!event.isAllDay && fontScale <= 1.3 && <View style={styles.timeColumn}><AppText variant="labelMedium" color="onSurfaceVariant" tabularNums>{formatTime(event.startTime)}</AppText><View style={styles.rail} /></View>}
    <View style={[styles.card, event.eventType === 'PERSONAL' && styles.personal]}>
      <View style={styles.header}>
        <AppText variant="labelMedium" color={event.eventType === 'PERSONAL' ? 'onSecondaryContainer' : 'onPrimaryContainer'} style={styles.type}>{LABELS[event.eventType]}</AppText>
        <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={'Hapus agenda ' + event.title} style={styles.touch}><Trash2 size={17} color={colors.onSurfaceVariant} /></Pressable>
      </View>
      <View style={styles.main}>
        <Pressable onPress={onToggleComplete} accessibilityRole="checkbox" accessibilityState={{ checked: event.isCompleted }}
          accessibilityLabel={(event.isCompleted ? 'Buka kembali ' : 'Selesaikan ') + event.title} style={styles.touch}>
          <View style={[styles.checkbox, event.isCompleted && styles.checked]}>{event.isCompleted && <Check size={16} color={colors.onPrimary} />}</View>
        </Pressable>
        <View style={styles.text}>
          <AppText variant="titleSmall" style={event.isCompleted ? styles.completed : undefined}>{event.title}</AppText>
          {!event.isAllDay && <AppText variant="bodySmall" color="onSurfaceVariant" tabularNums>{formatTime(event.startTime)}–{formatTime(event.endTime)}</AppText>}
          {event.location && <AppText variant="bodySmall" color="onSurfaceVariant">{event.location}</AppText>}
        </View>
      </View>
    </View>
  </View>
  );
};
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[2], marginBottom: space[4] },
  timeColumn: { width: 48, alignItems: 'center', paddingTop: space[4], gap: space[3] },
  rail: { width: 1, flex: 1, backgroundColor: colors.outlineVariant },
  card: { flex: 1, borderRadius: radius.lg, padding: space[3], backgroundColor: colors.primaryContainer },
  personal: { backgroundColor: colors.secondaryContainer },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { flex: 1, paddingLeft: space[2] },
  main: { flexDirection: 'row', alignItems: 'flex-start' },
  touch: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: space[1], paddingVertical: space[2] },
  checkbox: { width: 24, height: 24, borderRadius: radius.xs, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  checked: { borderColor: colors.primary, backgroundColor: colors.primary },
  completed: { textDecorationLine: 'line-through' },
});
