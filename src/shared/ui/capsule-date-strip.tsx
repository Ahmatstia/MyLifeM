import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatLocalDate, isDateOnly } from '@/shared/utils/local-date';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from './app-text';

export interface CapsuleDateStripProps {
  selectedDate: string;
  todayDate?: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function CapsuleDateStrip({
  selectedDate,
  todayDate = formatLocalDate(),
  onSelectDate,
}: CapsuleDateStripProps) {
  const days = useMemo(() => {
    if (!isDateOnly(selectedDate)) return [];
    const [year, month, day] = selectedDate.split('-').map(Number);
    const monday = new Date(year, month - 1, day);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    return WEEKDAYS.map((weekday, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const value = formatLocalDate(date);
      return { date: value, weekday, day: date.getDate(), selected: value === selectedDate, today: value === todayDate };
    });
  }, [selectedDate, todayDate]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((item) => (
        <Pressable
          key={item.date}
          onPress={() => onSelectDate(item.date)}
          accessibilityRole="button"
          accessibilityLabel={`${item.weekday}, ${item.date}${item.today ? ', hari ini' : ''}`}
          accessibilityState={{ selected: item.selected }}
          style={({ pressed }) => [styles.day, item.selected && styles.daySelected, pressed && styles.pressed]}
        >
          <AppText variant="labelSmall" style={[styles.weekday, item.selected && styles.selectedWeekday]}>
            {item.weekday}
          </AppText>
          <AppText variant="titleSmall" tabularNums style={[styles.date, item.selected && styles.selectedDate]}>
            {item.day}
          </AppText>
          <View style={[styles.dot, item.today && styles.todayDot, item.selected && item.today && styles.selectedTodayDot]} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space[2], paddingVertical: space[1] },
  day: {
    minWidth: 44,
    minHeight: 58,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F7F5F0',
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  daySelected: {
    backgroundColor: '#1E1E2E',
    borderColor: '#1E1E2E',
    elevation: 2,
    shadowColor: '#1E1E2E',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  weekday: { color: '#78716C', fontFamily: fontFamily.bold, fontSize: 11 },
  date: { color: '#1E1E2E', fontFamily: fontFamily.bold, fontSize: 15 },
  selectedWeekday: { color: '#D4D4D8' },
  selectedDate: { color: '#FFFFFF' },
  dot: { width: 4, height: 4, borderRadius: radius.full, backgroundColor: 'transparent', marginTop: 1 },
  todayDot: { backgroundColor: '#E06B52' },
  selectedTodayDot: { backgroundColor: '#E8A838' },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
