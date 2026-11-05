import React from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

export interface CategoryFilterChipsProps {
  categories: CategoryWithCount[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  style?: ViewStyle;
}

/**
 * Compact, scrollable filters for target categories.
 */
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
        {/* Chip "Semua" */}
        <Pressable
          onPress={() => onSelectCategory(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: isAllSelected }}
          style={({ pressed }) => [
            styles.chip,
            isAllSelected ? styles.chipSelected : styles.chipUnselected,
            pressed && styles.pressed,
          ]}
        >
          <Sparkles
            size={13}
            color="#1E1E2E"
            strokeWidth={2.5}
            style={styles.icon}
          />
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

        {/* Categories Chips */}
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
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.pressed,
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
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 2,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999, // Pill capsule
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
  },
  chipSelected: {
    backgroundColor: '#E8A838', // Custard Gold
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  chipUnselected: {
    backgroundColor: '#FAF5EB', // Warm Paper
  },
  chipText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  chipTextSelected: {
    color: '#1E1E2E',
  },
  chipTextUnselected: {
    color: '#504535',
  },
  icon: {
    marginRight: 6,
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
});
