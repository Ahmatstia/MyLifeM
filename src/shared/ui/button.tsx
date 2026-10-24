import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  View,
  type ViewStyle,
  type TextStyle,
  StyleSheet,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
import { AppText } from './app-text';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
export type ButtonSize = 'standard' | 'cta' | 'compact';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'standard',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
}) => {
  const isInteractive = !disabled && !loading;

  // Determine button height
  const height =
    size === 'cta'
      ? touchTarget.comfortable // 56
      : size === 'compact'
      ? touchTarget.compact // 40
      : touchTarget.min; // 48

  // Base styling per variant
  let backgroundColor: string = 'transparent';
  let borderColor: string | undefined = undefined;
  let textColor: keyof typeof colors = 'onPrimary';
  let loaderColor: string = colors.onPrimary;

  switch (variant) {
    case 'filled':
      backgroundColor = colors.primary;
      textColor = 'onPrimary';
      loaderColor = colors.onPrimary;
      break;
    case 'tonal':
      backgroundColor = colors.surfaceContainerHigh;
      textColor = 'onSurface';
      loaderColor = colors.onSurface;
      break;
    case 'outlined':
      backgroundColor = 'transparent';
      borderColor = colors.outline;
      textColor = 'primary';
      loaderColor = colors.primary;
      break;
    case 'text':
      backgroundColor = 'transparent';
      textColor = 'primary';
      loaderColor = colors.primary;
      break;
    case 'danger':
      backgroundColor = colors.error;
      textColor = 'onError';
      loaderColor = colors.onError;
      break;
  }

  const containerStyle: ViewStyle = {
    height,
    minHeight: size === 'compact' ? touchTarget.compact : touchTarget.min,
    minWidth: fullWidth ? '100%' : touchTarget.min,
    backgroundColor,
    borderRadius: radius.md,
    borderWidth: borderColor ? 1 : 0,
    borderColor,
    paddingHorizontal: size === 'compact' ? space[3] : space[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.45 : 1,
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        containerStyle,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
      hitSlop={size === 'compact' ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconMargin}>{leftIcon}</View>}
          <AppText
            variant={size === 'compact' ? 'labelMedium' : 'labelLarge'}
            color={textColor}
          >
            {title}
          </AppText>
          {rightIcon && <View style={styles.rightIconMargin}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginRight: space[2],
  },
  rightIconMargin: {
    marginLeft: space[2],
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});
