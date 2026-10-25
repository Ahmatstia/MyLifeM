import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { AppText } from './app-text';

export interface ProgressRingProps {
  /** Nilai saat ini, mis. 3 */
  value: number;
  /** Total, mis. 5 */
  total: number;
  /** Diameter luar dalam dp (DESIGN.md 7.12: 56 atau 96) */
  size?: number;
  strokeWidth?: number;
  /** Warna track & isi; default untuk latar terang. Pakai onHero di atas kartu hero. */
  tone?: 'default' | 'onHero';
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * ProgressRing (DESIGN.md 7.12). Angka tabular di tengah, wajib ada teks angka selain cincin.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  total,
  size = 96,
  strokeWidth = 8,
  tone = 'default',
  label = 'Selesai',
  style,
}) => {
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const ratio = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;

  const trackColor = tone === 'onHero' ? colors.primaryContainer : colors.surfaceContainerHighest;
  const fillColor = tone === 'onHero' ? colors.onPrimary : colors.primary;
  const textColor = tone === 'onHero' ? 'onPrimary' : 'onSurface';

  return (
    <View
      accessible
      accessibilityLabel={`${value} dari ${total} ${label.toLowerCase()}`}
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={tone === 'onHero' ? 0.35 : 1}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          fill="none"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <AppText variant="titleMedium" color={textColor} tabularNums align="center">
          {value} dari {total}
        </AppText>
        <AppText variant="labelSmall" color={textColor} align="center">
          {label}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
