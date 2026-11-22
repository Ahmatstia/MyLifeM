import React from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { fontFamily, touchTarget, space, typography } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui/app-text';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

export interface CategoryFilterChipsProps {
  categories: CategoryWithCount[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  style?: ViewStyle;
}

export const CategoryFilterChips: React.FC<CategoryFilterChipsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  style,
}) => {
  const isAllSelected = selectedCategoryId === null;

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          onPress={() => onSelectCategory(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: isAllSelected }}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.pressed,
            isAllSelected ? styles.chipSelected : styles.chipUnselected,
          ]}
        >
          <AppText
            variant="labelMedium"
            style={[
              styles.chipText,
              isAllSelected ? styles.chipTextSelected : styles.chipTextUnselected,
            ]}
          >
            Semua
          </AppText>
        </Pressable>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.pressed,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <AppText
                variant="labelMedium"
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {cat.name}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pressed: { backgroundColor: colors.surfaceContainer },
  container: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, },
  scrollContent: {
    gap: space[1],
  },
  chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: touchTarget.min, minHeight: touchTarget.min, paddingVertical: space[2], paddingHorizontal: space[3], borderBottomWidth: space[1], borderBottomColor: 'transparent', },
  chipSelected: { borderBottomColor: colors.primary, },
  chipUnselected: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: typography.labelLarge.fontSize,
    fontFamily: fontFamily.semibold,
  },
  chipTextSelected: { color: colors.primary, fontFamily: fontFamily.bold, },
  chipTextUnselected: {
    color: colors.onSurfaceVariant,
  },
});
