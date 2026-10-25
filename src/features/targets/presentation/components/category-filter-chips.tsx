import React from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, elevation } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

export interface CategoryFilterChipsProps {
  categories: CategoryWithCount[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onManageCategories: () => void;
  style?: ViewStyle;
}

/**
 * CategoryFilterChips: Pil filter marshmallow untuk kategori Target.
 */
export const CategoryFilterChips: React.FC<CategoryFilterChipsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onManageCategories,
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
          <AppText
            variant="labelMedium"
            color={isAllSelected ? 'onPrimary' : 'onSurfaceVariant'}
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
                color={isSelected ? 'onPrimary' : 'onSurfaceVariant'}
              >
                {cat.name}
              </AppText>
            </Pressable>
          );
        })}

        {/* Action Button: Kelola / Tambah Kategori */}
        <Pressable
          onPress={onManageCategories}
          accessibilityRole="button"
          accessibilityLabel="Kelola kategori"
          style={({ pressed }) => [styles.manageChip, pressed && styles.pressed]}
        >
          <Plus size={14} color={colors.primary} />
          <AppText variant="labelMedium" color="primary">
            Kategori
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: space[3],
  },
  scrollContent: {
    paddingHorizontal: space[1],
    gap: space[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    ...elevation.level1,
  },
  chipUnselected: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    gap: 4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
