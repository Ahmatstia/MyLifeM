import React from 'react';
import { View, Pressable, type ViewStyle, type StyleProp, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';

export type CardVariant = 'filled' | 'elevated' | 'outlined' | 'highlight';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'filled',
  padding = space[4], // 16 dp
  onPress,
  style,
}) => {
  let backgroundColor: string = colors.surfaceContainerLow;
  let borderColor: string | undefined = colors.outlineVariant;
  let borderWidth = 1;

  switch (variant) {
    case 'filled':
      backgroundColor = colors.surfaceContainerLow;
      borderColor = colors.outlineVariant;
      borderWidth = 1;
      break;
    case 'elevated':
      backgroundColor = colors.surfaceContainer;
      borderColor = colors.outline;
      borderWidth = 1;
      break;
    case 'outlined':
      backgroundColor = colors.surface;
      borderColor = colors.outline;
      borderWidth = 1;
      break;
    case 'highlight':
      backgroundColor = colors.surfaceContainer;
      borderColor = colors.primary;
      borderWidth = 1.5;
      break;
  }

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius.lg,
    borderWidth,
    borderColor,
    padding,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
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
