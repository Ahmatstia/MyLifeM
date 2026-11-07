import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatLocalDate, isDateOnly } from '@/shared/utils/local-date';
import { space, fontFamily } from '@/theme/tokens';
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
          style={({ pressed }) => [
            styles.pillBar,
            item.selected && styles.pillBarSelected,
            item.today && !item.selected && styles.pillBarToday,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="labelSmall"
            style={[
              styles.weekday,
              item.selected && styles.selectedWeekday,
              item.today && !item.selected && styles.todayWeekday,
            ]}
          >
            {item.weekday}
          </AppText>
          <View style={[styles.dateCircle, item.selected && styles.selectedDateCircle]}>
            <AppText variant="titleSmall" tabularNums style={[styles.date, item.selected && styles.selectedDate]}>
              {item.day}
            </AppText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: space[1], paddingHorizontal: 2 },
  pillBar: {
    minWidth: 44,
    height: 64,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(18, 19, 22, 0.08)',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#121316',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  pillBarSelected: {
    backgroundColor: '#121316',
    borderColor: '#121316',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  pillBarToday: {
    borderColor: 'rgba(14, 104, 82, 0.35)',
  },
  weekday: { color: '#717684', fontFamily: fontFamily.bold, fontSize: 10, letterSpacing: 0.3 },
  selectedWeekday: { color: '#CEF5EB' },
  todayWeekday: { color: '#0E6852' },
  dateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedDateCircle: {
    backgroundColor: 'rgba(206, 245, 235, 0.15)',
  },
  date: { color: '#121316', fontFamily: fontFamily.bold, fontSize: 15 },
  selectedDate: { color: '#FFFFFF' },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
