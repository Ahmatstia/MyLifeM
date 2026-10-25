import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space, elevation } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';

export interface DateStripHeaderProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  style?: ViewStyle;
}

/**
 * DateStripHeader: Kapsul kalender empuk & lucu (cute marshmallow calendar pills).
 */
export const DateStripHeader: React.FC<DateStripHeaderProps> = ({
  selectedDate,
  onSelectDate,
  style,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Generate 14 days around today (-3 days to +10 days)
  const days = useMemo(() => {
    const list = [];
    const base = new Date();
    base.setDate(base.getDate() - 3);

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({ iso, dayName, dayNum });
    }
    return list;
  }, []);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item) => {
          const isSelected = selectedDate === item.iso;
          const isToday = todayStr === item.iso;

          return (
            <Pressable
              key={item.iso}
              onPress={() => onSelectDate(item.iso)}
              accessibilityRole="button"
              accessibilityLabel={`${item.dayName}, ${item.dayNum}`}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.dayCard,
                isSelected ? styles.dayCardSelected : styles.dayCardUnselected,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="labelSmall"
                color={isSelected ? 'onPrimary' : 'onSurfaceVariant'}
                style={styles.dayName}
              >
                {item.dayName}
              </AppText>

              <AppText
                variant="titleLarge"
                color={isSelected ? 'onPrimary' : 'onSurface'}
                tabularNums
                style={styles.dayNum}
              >
                {item.dayNum}
              </AppText>

              {/* Indicator dot for Today */}
              {isToday && (
                <View
                  style={[
                    styles.todayDot,
                    {
                      backgroundColor: isSelected
                        ? colors.onPrimary
                        : colors.secondary,
                    },
                  ]}
                />
              )}
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
    gap: space[2],
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  dayCard: {
    width: 54,
    height: 74,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[2],
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    ...elevation.level1,
  },
  dayCardUnselected: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dayName: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  dayNum: {
    fontSize: 20,
    lineHeight: 24,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
