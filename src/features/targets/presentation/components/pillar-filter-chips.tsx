import React from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space, elevation } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import type { LifePillarEntity } from '../../domain/entities/target.entity';

export interface PillarFilterChipsProps {
  pillars: LifePillarEntity[];
  selectedPillarId: string | null;
  onSelectPillar: (pillarId: string | null) => void;
  style?: ViewStyle;
}

/**
 * PillarFilterChips: Pil filter pastel yang empuk (cute marshmallow tabs).
 */
export const PillarFilterChips: React.FC<PillarFilterChipsProps> = ({
  pillars,
  selectedPillarId,
  onSelectPillar,
  style,
}) => {
  const isAllSelected = selectedPillarId === null;

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Chip "Semua" */}
        <Pressable
          onPress={() => onSelectPillar(null)}
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

        {/* Pillars Chips */}
        {pillars.map((pillar) => {
          const isSelected = selectedPillarId === pillar.id;

          return (
            <Pressable
              key={pillar.id}
              onPress={() => onSelectPillar(pillar.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.pillarDot,
                  { backgroundColor: isSelected ? colors.onPrimary : (pillar.color || colors.primary) },
                ]}
              />
              <AppText
                variant="labelMedium"
                color={isSelected ? 'onPrimary' : 'onSurfaceVariant'}
              >
                {pillar.name}
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
  pillarDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    marginRight: space[2],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
