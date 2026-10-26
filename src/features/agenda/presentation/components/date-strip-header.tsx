import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { formatLocalDate } from '@/shared/utils/local-date';

export interface DateStripHeaderProps { selectedDate: string; todayDate?: string; onSelectDate: (date: string) => void; style?: ViewStyle; }

export const DateStripHeader: React.FC<DateStripHeaderProps> = ({ selectedDate, todayDate, onSelectDate, style }) => {
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const today = todayDate || formatLocalDate();
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - (selected.getDay() + 6) % 7);
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    return { key: formatLocalDate(date), name: date.toLocaleDateString('id-ID', { weekday: 'short' }), day: date.getDate() };
  });
  const moveWeek = (offset: number) => {
    const date = new Date(selected);
    date.setDate(date.getDate() + offset);
    onSelectDate(formatLocalDate(date));
  };
  return (
    <View style={style}>
      <View style={styles.navigation}>
        <View style={styles.month}><AppText variant="titleSmall">{selected.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</AppText>
          <Pressable onPress={() => onSelectDate(today)} accessibilityRole="button" style={styles.today}><AppText variant="labelMedium" color="primary">Hari ini</AppText></Pressable>
        </View>
        <Pressable onPress={() => moveWeek(-7)} accessibilityRole="button" accessibilityLabel="Minggu sebelumnya" style={styles.arrow}><ChevronLeft size={20} color={colors.primary} /></Pressable>
        <Pressable onPress={() => moveWeek(7)} accessibilityRole="button" accessibilityLabel="Minggu berikutnya" style={styles.arrow}><ChevronRight size={20} color={colors.primary} /></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {days.map(item => <Pressable key={item.key} onPress={() => onSelectDate(item.key)}
          accessibilityRole="button" accessibilityLabel={item.key + (item.key === today ? ', hari ini' : '')}
          accessibilityState={{ selected: item.key === selectedDate }}
          style={[styles.day, item.key === selectedDate && styles.selected]}>
          <AppText variant="labelMedium" color={item.key === selectedDate ? 'onPrimary' : 'onSurfaceVariant'}>{item.name}</AppText>
          <AppText variant="titleLarge" color={item.key === selectedDate ? 'onPrimary' : 'onSurface'} tabularNums>{item.day}</AppText>
          <View style={[styles.dot, { backgroundColor: item.key === today ? item.key === selectedDate ? colors.highlight : colors.primary : 'transparent' }]} />
        </Pressable>)}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  navigation: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginBottom: space[3] },
  month: { flex: 1 },
  today: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: space[3] },
  arrow: { width: 48, minHeight: 48, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  days: { gap: space[2] },
  day: { minWidth: 56, minHeight: 88, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center', padding: space[3], gap: space[1] },
  selected: { backgroundColor: colors.primary },
  dot: { width: 5, height: 5, borderRadius: radius.full },
});
