import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Star } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from './app-text';
import { formatLocalDate } from '@/shared/utils/local-date';

export interface CapsuleDateStripProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  /** Number of days before today to show, default 1 */
  daysBefore?: number;
  /** Total days to show, default 7 */
  totalDays?: number;
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CapsuleDateStrip: React.FC<CapsuleDateStripProps> = ({
  selectedDate,
  onSelectDate,
  daysBefore = 2,
  totalDays = 7,
}) => {
  const days = useMemo(() => {
    const today = new Date();
    const result: {
      dateStr: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    const start = new Date(today);
    start.setDate(today.getDate() - daysBefore);

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = formatLocalDate(d);
      const isToday = dateStr === formatLocalDate(today);
      const isSelected = dateStr === selectedDate;

      result.push({
        dateStr,
        dayName: DAY_NAMES[d.getDay()],
        dayNumber: d.getDate(),
        isToday,
        isSelected,
      });
    }

    return result;
  }, [selectedDate, daysBefore, totalDays]);

  const handleSelect = (dateStr: string) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Haptics optional on web / unsupported envs
    }
    onSelectDate(dateStr);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item) => {
          const isSelected = item.isSelected;
          return (
            <Pressable
              key={item.dateStr}
              onPress={() => handleSelect(item.dateStr)}
              accessibilityRole="button"
              accessibilityLabel={`${item.dayName}, tanggal ${item.dayNumber}${item.isToday ? ', hari ini' : ''}${isSelected ? ', terpilih' : ''}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.capsule,
                isSelected ? styles.capsuleActive : styles.capsuleInactive,
              ]}
            >
              {/* Star on top */}
              <Star
                size={12}
                fill={isSelected ? colors.bento.lemon : 'transparent'}
                color={isSelected ? colors.bento.lemon : colors.outline}
                strokeWidth={2}
                style={styles.star}
              />

              {/* Day name */}
              <AppText
                variant="labelSmall"
                style={[
                  styles.dayText,
                  { color: isSelected ? colors.bento.textLightMuted : colors.onSurfaceVariant },
                ]}
              >
                {item.dayName}
              </AppText>

              {/* Day number */}
              <AppText
                variant="titleMedium"
                tabularNums
                style={[
                  styles.numberText,
                  { color: isSelected ? colors.bento.textLight : colors.onSurface },
                ]}
              >
                {item.dayNumber}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: space[3],
  },
  scrollContent: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '100%',
  },
  capsule: {
    width: 48,
    height: 84,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[2] + 2,
  },
  capsuleInactive: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
  },
  capsuleActive: {
    backgroundColor: colors.bento.obsidian,
    shadowColor: colors.bento.obsidian,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.04 }],
  },
  star: {
    marginTop: 2,
  },
  dayText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  numberText: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
});
