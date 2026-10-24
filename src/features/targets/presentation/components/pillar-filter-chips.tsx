import React from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import type { LifePillarEntity } from '../../domain/entities/target.entity';

export interface PillarFilterChipsProps {
  pillars: LifePillarEntity[];
  selectedPillarId: string | null;
  onSelectPillar: (pillarId: string | null) => void;
  style?: ViewStyle;
}

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
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          style={[
            styles.chip,
            isAllSelected ? styles.chipSelected : styles.chipUnselected,
          ]}
        >
          <AppText
            variant="labelMedium"
            color={isAllSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
          >
            Semua Pilar
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
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              {/* Pillar indicator dot */}
              <View
                style={[
                  styles.pillarDot,
                  { backgroundColor: pillar.color || colors.primary },
                ]}
              />
              <AppText
                variant="labelMedium"
                color={isSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
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
    height: 40,
    minHeight: 40,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
  },
  pillarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: space[2],
  },
});
