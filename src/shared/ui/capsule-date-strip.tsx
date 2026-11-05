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
          <AppText variant="labelSmall" style={[styles.weekday, item.selected && styles.selectedText]}>
            {item.weekday}
          </AppText>
          <AppText variant="titleSmall" tabularNums style={[styles.date, item.selected && styles.selectedText]}>
            {item.day}
          </AppText>
          <View style={[styles.dot, item.today && styles.todayDot, item.selected && item.today && styles.selectedDot]} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space[2], paddingVertical: 4 },
  day: {
    minWidth: 46,
    minHeight: 62,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  daySelected: {
    backgroundColor: '#E8A838', // Custard Gold
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  weekday: { color: '#504535', fontFamily: fontFamily.bold, fontSize: 11 },
  date: { color: '#1E1E2E', fontFamily: fontFamily.bold, fontSize: 16 },
  selectedText: { color: '#1E1E2E' },
  dot: { width: 5, height: 5, borderRadius: radius.full, backgroundColor: 'transparent', marginTop: 1 },
  todayDot: { backgroundColor: '#E06B52' },
  selectedDot: { backgroundColor: '#1E1E2E' },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
});
