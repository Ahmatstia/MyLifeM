import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';

export interface DateStripHeaderProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  style?: ViewStyle;
}

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
              hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
              style={[
                styles.dayCard,
                isSelected ? styles.dayCardSelected : styles.dayCardUnselected,
              ]}
            >
              <AppText
                variant="labelSmall"
                color={isSelected ? 'onPrimaryContainer' : 'onSurfaceSubtle'}
                style={styles.dayName}
              >
                {item.dayName}
              </AppText>

              <AppText
                variant="titleMedium"
                color={isSelected ? 'onPrimaryContainer' : 'onSurface'}
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
                        ? colors.primary
                        : colors.highlight,
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
    marginVertical: space[2],
  },
  scrollContent: {
    paddingHorizontal: space[1],
    gap: space[2],
  },
  dayCard: {
    width: 52,
    height: 68,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[2],
    borderWidth: 1,
  },
  dayCardSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  dayCardUnselected: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
  },
  dayName: {
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  dayNum: {
    fontWeight: '700',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});
