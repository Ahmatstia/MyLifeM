import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, radius, space, touchTarget } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { formatLocalDate } from '@/shared/utils/local-date';

const gridMinWidth = 7 * touchTarget.min;

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
  const { width } = useWindowDimensions();
  const narrow = width < gridMinWidth + space[4];
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const today = todayDate || formatLocalDate();

  const firstOfMonth = new Date(year, month - 1, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(1 - ((firstOfMonth.getDay() + 6) % 7));

  const daysInMonth = new Date(year, month, 0).getDate();
  const rows = Math.ceil((((firstOfMonth.getDay() + 6) % 7) + daysInMonth) / 7);
  const monthWeeks = Array.from({ length: rows }, (_, w) =>
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

  const moveWeek = (offset: number) => {
    const date = new Date(selected);
    date.setDate(date.getDate() + offset);
    onSelectDate(formatLocalDate(date));
  };

  const monthTitle = selected.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const monthGrid = (
    <View style={styles.fullGrid}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((lbl) => (
          <View key={lbl} style={styles.weekdayCell}>
            <AppText variant="labelMedium" style={styles.weekdayText}>{lbl}</AppText>
          </View>
        ))}
      </View>

      {/* Complete month, including months that span six weeks. */}
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
                  style={({ pressed }) => [
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    !isSelected && isToday && styles.dayCellToday,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText
                    variant="bodyMedium"
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
      </View>
    </View>
  );

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.monthPillBar}>
        <Pressable
          onPress={() => moveWeek(-7)}
          accessibilityRole="button"
          accessibilityLabel="Minggu sebelumnya"
          style={({ pressed }) => [styles.navArrow, pressed && styles.pressed]}
        >
          <ChevronLeft size={space[5]} color={colors.onSurface} />
        </Pressable>

        <Pressable
          onPress={() => onSelectDate(today)}
          accessibilityRole="button"
          accessibilityLabel={monthTitle + ', kembali ke hari ini'}
          style={({ pressed }) => [styles.monthCenter, pressed && styles.pressed]}
        >
          <AppText variant="titleMedium">{monthTitle}</AppText>
        </Pressable>

        <Pressable
          onPress={() => moveWeek(7)}
          accessibilityRole="button"
          accessibilityLabel="Minggu berikutnya"
          style={({ pressed }) => [styles.navArrow, pressed && styles.pressed]}
        >
          <ChevronRight size={space[5]} color={colors.onSurface} />
        </Pressable>
      </View>

      {narrow ? (
        <ScrollView horizontal showsHorizontalScrollIndicator style={styles.gridEdge}>
          {monthGrid}
        </ScrollView>
      ) : <View style={styles.gridEdge}>{monthGrid}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  monthPillBar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.outlineVariant },
  navArrow: { width: touchTarget.min, height: touchTarget.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  monthCenter: { flex: 1, minHeight: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  gridEdge: { marginHorizontal: -space[3] },
  fullGrid: { minWidth: gridMinWidth },
  weekdayRow: { flexDirection: 'row', paddingVertical: space[2] },
  weekdayCell: { flex: 1, alignItems: 'center' },
  weekdayText: { color: colors.onSurfaceVariant },
  gridContainer: { gap: 0 },
  weekRow: { flexDirection: 'row' },
  dayCell: {
    flex: 1,
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingVertical: space[1],
  },
  dayCellSelected: { backgroundColor: colors.primary },
  dayCellToday: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.primary },
  dayNumber: { color: colors.onSurface, fontFamily: fontFamily.semibold },
  dayNumberOutside: { color: colors.onSurfaceVariant },
  dayNumberSelected: { color: colors.onPrimary, fontFamily: fontFamily.bold },
  pressed: { borderWidth: space[1], borderColor: colors.outline },
});
