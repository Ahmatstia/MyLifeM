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
  container: {
    backgroundColor: '#F1EBDC',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  scrollContent: {
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  chipSelected: {
    backgroundColor: s.forest,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamily.semibold,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
  chipTextUnselected: {
    color: s.inkMuted,
  },
});
