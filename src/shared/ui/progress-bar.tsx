import React from 'react';
import { View, type ViewStyle, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string; // hex or color token
  height?: number; // 6, 8, or 12 dp
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  height = 8,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.surfaceContainerHighest,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            borderRadius: radius.full,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
