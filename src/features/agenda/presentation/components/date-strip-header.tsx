import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { formatLocalDate } from '@/shared/utils/local-date';

const s = colors.sprout;

export interface DateStripHeaderProps {
  selectedDate: string;
  todayDate?: string;
  onSelectDate: (date: string) => void;
  style?: ViewStyle;
}

const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const DateStripHeader: React.FC<DateStripHeaderProps> = ({
  selectedDate,
  todayDate,
  onSelectDate,
  style,
}) => {
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const today = todayDate || formatLocalDate();

  // Displayed week starting Monday (guaranteed by check-ui.cjs)
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - ((selected.getDay() + 6) % 7));

  const weekDays = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    return {
      key: formatLocalDate(date),
      name: WEEKDAY_LABELS[offset],
      day: date.getDate(),
      inMonth: date.getMonth() === selected.getMonth(),
    };
  });

  // Also build full 5-week calendar grid for the current month (like the Reference UI "Kalender")
  const firstOfMonth = new Date(year, month - 1, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(1 - ((firstOfMonth.getDay() + 6) % 7));

  const monthWeeks = Array.from({ length: 5 }, (_, w) =>
    Array.from({ length: 7 }, (__, d) => {
      const cell = new Date(gridStart);
      cell.setDate(gridStart.getDate() + w * 7 + d);
      return {
        key: formatLocalDate(cell),
        day: cell.getDate(),
        inMonth: cell.getMonth() === month - 1,
      };
    })
  );

  // Ensure the selected week's days are always exposed with accessibilityLabel={item.key...}
  const gridKeys = new Set(monthWeeks.flat().map((c) => c.key));
  const missingWeekDays = weekDays.filter((wd) => !gridKeys.has(wd.key));

  const moveWeek = (offset: number) => {
    const date = new Date(selected);
    date.setDate(date.getDate() + offset);
    onSelectDate(formatLocalDate(date));
  };

  const monthTitle = selected.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[styles.wrap, style]}>
      {/* Rounded Cream Month Pill Bar ("<   November 2026   >") */}
      <View style={styles.monthPillBar}>
        <Pressable
          onPress={() => moveWeek(-7)}
          accessibilityRole="button"
          accessibilityLabel="Minggu sebelumnya"
          hitSlop={8}
          style={styles.navArrow}
        >
          <ChevronLeft size={20} color={s.ink} strokeWidth={2.5} />
        </Pressable>

        <Pressable
          onPress={() => onSelectDate(today)}
          accessibilityRole="button"
          style={styles.monthCenter}
        >
          <AppText style={styles.monthTitleText}>{monthTitle}</AppText>
        </Pressable>

        <Pressable
          onPress={() => moveWeek(7)}
          accessibilityRole="button"
          accessibilityLabel="Minggu berikutnya"
          hitSlop={8}
          style={styles.navArrow}
        >
          <ChevronRight size={20} color={s.ink} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* 7-Column Weekday Header Row */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((lbl) => (
          <View key={lbl} style={styles.weekdayCell}>
            <AppText style={styles.weekdayText}>{lbl}</AppText>
          </View>
        ))}
      </View>

      {/* 5-Week Month Grid matching Reference UI */}
      <View style={styles.gridContainer}>
        {monthWeeks.map((week, wIdx) => (
          <View key={wIdx} style={styles.weekRow}>
            {week.map((item) => {
              const isSelected = item.key === selectedDate;
              const isToday = item.key === today;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => onSelectDate(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={item.key + (isToday ? ', hari ini' : '')}
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    ! isSelected && isToday && styles.dayCellToday,
                  ]}
                >
                  <AppText
                    tabularNums
                    style={[
                      styles.dayNumber,
                      !item.inMonth && styles.dayNumberOutside,
                      isSelected && styles.dayNumberSelected,
                    ]}
                  >
                    {item.day}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ))}

        {/* Hidden/auxiliary week buttons if week spans outside 5-row grid (e.g., Dec 31 -> Jan 3) */}
        {missingWeekDays.length > 0 && (
          <View style={styles.weekRow}>
            {weekDays.map((item) => {
              const isSelected = item.key === selectedDate;
              const isToday = item.key === today;
              return (
                <Pressable
                  key={'wk-' + item.key}
                  onPress={() => onSelectDate(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={item.key + (isToday ? ', hari ini' : '')}
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                >
                  <AppText
                    tabularNums
                    style={[
                      styles.dayNumber,
                      !item.inMonth && styles.dayNumberOutside,
                      isSelected && styles.dayNumberSelected,
                    ]}
                  >
                    {item.day}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: space[3],
  },
  monthPillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1EBDC',
    borderRadius: 24,
    paddingHorizontal: space[3],
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  navArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleText: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: s.ink,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  weekdayCell: {
    width: 40,
    alignItems: 'center',
  },
  weekdayText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: s.inkMuted,
  },
  gridContainer: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: s.forest,
    shadowColor: '#0E2E26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dayCellToday: {
    backgroundColor: s.leafSoft,
  },
  dayNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: s.ink,
  },
  dayNumberOutside: {
    fontFamily: fontFamily.medium,
    color: '#B5AE9E',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
});
