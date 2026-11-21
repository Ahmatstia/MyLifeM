import React from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { fontFamily } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui/app-text';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

const s = colors.sprout;

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
          style={[
            styles.chip,
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
              style={[
                styles.chip,
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
  container: { borderBottomWidth: 1, borderBottomColor: colors.border, },
  scrollContent: {
    gap: 6,
  },
  chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingVertical: 7, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', },
  chipSelected: { borderBottomColor: s.forest, },
  chipUnselected: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamily.semibold,
  },
  chipTextSelected: { color: s.forest, fontFamily: fontFamily.bold, },
  chipTextUnselected: {
    color: s.inkMuted,
  },
});
