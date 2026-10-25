import React from 'react';
import { View, Pressable, type ViewStyle, type StyleProp, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { elevation, radius, space } from '@/theme/tokens';

export type CardVariant = 'filled' | 'elevated' | 'outlined' | 'highlight' | 'hero';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Card (DESIGN.md 7.10 + referensi UI "puffy").
 * - filled: surfaceContainerLow, tanpa border
 * - elevated: kartu putih dengan bayangan lembut level 1 (daftar item di referensi)
 * - outlined: border outlineVariant
 * - highlight: primaryContainer lembut (ringkasan)
 * - hero: primary penuh, radius xl (maks. satu per layar)
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'filled',
  padding = space[4], // 16 dp
  onPress,
  style,
}) => {
  let backgroundColor: string = colors.surfaceContainerLow;
  let borderColor: string | undefined;
  let borderWidth = 0;
  let borderRadius: number = radius.xl;
  let shadow: ViewStyle = {};

  switch (variant) {
    case 'filled':
      backgroundColor = colors.surfaceContainerLow;
      borderRadius = radius.lg;
      break;
    case 'elevated':
      backgroundColor = colors.surfaceContainerLowest;
      borderRadius = radius.xl;
      borderColor = colors.outlineVariant;
      borderWidth = 1;
      shadow = elevation.level1;
      break;
    case 'outlined':
      backgroundColor = colors.surfaceContainerLowest;
      borderRadius = radius.xl;
      borderColor = colors.outlineVariant;
      borderWidth = 1;
      break;
    case 'highlight':
      backgroundColor = colors.primaryContainer;
      borderRadius = radius.xl;
      borderColor = '#D9D3F8';
      borderWidth = 1;
      break;
    case 'hero':
      backgroundColor = colors.primary;
      borderRadius = radius.xxl;
      shadow = elevation.level3;
      break;
  }

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
    padding,
    ...shadow,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [cardStyle, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
  },
});
