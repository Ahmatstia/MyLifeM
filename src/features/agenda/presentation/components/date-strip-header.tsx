import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { layout, screenGutter, fontFamily, radius, space, touchTarget } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { formatLocalDate } from '@/shared/utils/local-date';

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
  const { width, fontScale } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const cellWidth = Math.max(touchTarget.min, Math.ceil(fontScale * space[10]));
  const gridMinWidth = 7 * cellWidth + 6 * space[0.5];
  const insets = useSafeAreaInsets();
  const available = width - insets.left - insets.right;
  const columnWidth = Math.min(available, layout.maxWidth) - 2 * screenGutter(available);
  // A full week can borrow a little space while keeping each day easy to tap.
  const bleed = Math.min(space[3], Math.max(0, (gridMinWidth - columnWidth) / 2));
  const narrow = columnWidth + 2 * bleed < gridMinWidth;
  const wrapWeek = narrow && !expanded;
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

  const visibleWeeks = expanded ? monthWeeks : monthWeeks.filter(week => week.some(date => date.key === selectedDate));
  const move = (direction: number) => {
    const date = new Date(selected);
    if (expanded) {
      const lastDay = new Date(year, month + direction, 0).getDate();
      date.setMonth(month - 1 + direction, Math.min(day, lastDay));
    } else {
      date.setDate(date.getDate() + direction * 7);
    }
    onSelectDate(formatLocalDate(date));
  };

  const monthTitle = selected.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const monthGrid = (
    <View style={!wrapWeek && { minWidth: gridMinWidth }}>
      {expanded && <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((lbl) => (
          <View key={lbl} style={styles.weekdayCell}>
            <AppText variant="labelMedium" style={styles.weekdayText}>{lbl}</AppText>
          </View>
        ))}
      </View>}

      {/* Complete month, including months that span six weeks. */}
      <View style={styles.gridContainer}>
        {visibleWeeks.map((week, wIdx) => (
          <View key={wIdx} style={[styles.weekRow, wrapWeek && styles.wrapWeek]}>
            {week.map((item, weekday) => {
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
                    !expanded && styles.weekKey,
                    wrapWeek ? styles.wrappedDay : { minWidth: cellWidth },
                    isSelected && styles.dayCellSelected,
                    !isSelected && isToday && styles.dayCellToday,
                    pressed && styles.pressed,
                  ]}
                >
                  {!expanded && <AppText variant="labelMedium" color={isSelected ? 'onPrimary' : 'onSurfaceVariant'}>{WEEKDAY_LABELS[weekday]}</AppText>}
                  <AppText
                    variant={expanded ? 'bodyMedium' : 'titleLarge'}
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
          onPress={() => setExpanded(value => !value)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Tampilkan satu minggu' : 'Tampilkan satu bulan'}
          accessibilityState={{ expanded }}
          style={({ pressed }) => [styles.monthCenter, pressed && styles.pressed]}>
          <AppText variant="titleMedium">{monthTitle}</AppText>
          {expanded ? <ChevronUp size={space[4]} color={colors.primary} /> : <ChevronDown size={space[4]} color={colors.primary} />}
        </Pressable>
        {selectedDate !== today && (
          <Pressable onPress={() => onSelectDate(today)} accessibilityRole="button" accessibilityLabel="Kembali ke hari ini"
            style={({ pressed }) => [styles.todayKey, pressed && styles.pressed]}>
            <AppText variant="labelMedium" color="primary">Hari ini</AppText>
          </Pressable>
        )}
        <Pressable onPress={() => move(-1)} accessibilityRole="button"
          accessibilityLabel={expanded ? 'Bulan sebelumnya' : 'Minggu sebelumnya'}
          style={({ pressed }) => [styles.navArrow, pressed && styles.pressed]}>
          <ChevronLeft size={space[5]} color={colors.onSurface} />
        </Pressable>
        <Pressable onPress={() => move(1)} accessibilityRole="button"
          accessibilityLabel={expanded ? 'Bulan berikutnya' : 'Minggu berikutnya'}
          style={({ pressed }) => [styles.navArrow, pressed && styles.pressed]}>
          <ChevronRight size={space[5]} color={colors.onSurface} />
        </Pressable>
      </View>

      {narrow && expanded ? (
        <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginHorizontal: -bleed }}>
          {monthGrid}
        </ScrollView>
      ) : <View style={{ marginHorizontal: -bleed }}>{monthGrid}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  monthPillBar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  navArrow: { width: touchTarget.min, height: touchTarget.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  monthCenter: { flexGrow: 1, flexShrink: 1, minHeight: touchTarget.min, gap: space[1], flexDirection: 'row', alignItems: 'center' },
  todayKey: { minWidth: touchTarget.min, minHeight: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  weekKey: { minHeight: space[16], backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.md, borderBottomWidth: 0 },
  weekdayRow: { flexDirection: 'row', gap: space[0.5], paddingVertical: space[2] },
  weekdayCell: { flex: 1, alignItems: 'center' },
  weekdayText: { color: colors.onSurfaceVariant },
  gridContainer: { gap: 0 },
  weekRow: { flexDirection: 'row', gap: space[0.5] },
  wrapWeek: { flexWrap: 'wrap', gap: space[1] },
  wrappedDay: { flexBasis: '23%', flexGrow: 1, borderRadius: radius.sm },
  dayCell: {
    flex: 1,
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingVertical: space[1],
  },
  dayCellSelected: { backgroundColor: colors.primary, borderColor: colors.highlight, borderRadius: radius.md },
  dayCellToday: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.primary },
  dayNumber: { color: colors.onSurface, fontFamily: fontFamily.semibold },
  dayNumberOutside: { color: colors.onSurfaceVariant },
  dayNumberSelected: { color: colors.onPrimary, fontFamily: fontFamily.bold },
  pressed: { opacity: 0.78 },
});
