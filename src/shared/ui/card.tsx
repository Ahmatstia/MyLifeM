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
 * Shared card surfaces (DESIGN_V2.md).
 * - filled: surfaceContainerLow, tanpa border
 * - elevated: kartu putih dengan bayangan lembut level 1 (daftar item di referensi)
 * - outlined: border outlineVariant
 * - highlight: primaryContainer lembut (ringkasan)
 * - hero: petrol dengan dekorasi bubble yang tidak menangkap sentuhan.
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
      break;
    case 'hero':
      backgroundColor = colors.hero;
      borderRadius = radius.xxl;
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

  const content = variant === 'hero' ? (
    <>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.decoration}>
        <View style={styles.bubble} />
        <View style={styles.smallBubble} />
      </View>
      <View>{children}</View>
    </>
  ) : children;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [cardStyle, pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  decoration: { ...StyleSheet.absoluteFill, borderRadius: radius.xxl, overflow: 'hidden' },
  bubble: { position: 'absolute', width: 144, height: 144, borderRadius: radius.full, right: -96, top: -40, backgroundColor: colors.heroDecoration },
  smallBubble: { position: 'absolute', width: 80, height: 80, borderRadius: radius.full, right: -64, bottom: -36, backgroundColor: colors.highlight },
  pressed: {
    opacity: 0.88,
  },
});
