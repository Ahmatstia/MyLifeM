import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export type WaveVariant = 'home' | 'form' | 'stats' | 'plain' | 'detail';
export interface WaveBackdropProps {
  variant?: WaveVariant;
  height?: number;
  withBottomHills?: boolean;
}

/** A printed edge that never occupies content space. */
export const WaveBackdrop: React.FC<WaveBackdropProps> = ({ variant = 'plain' }) => (
  <View pointerEvents="none" accessible={false} style={styles.edge}>
    <View style={[styles.mark, { backgroundColor: variant === 'form' ? colors.sprout.grape : colors.primary }]} />
    <View style={styles.accent} />
    <View style={styles.rule} />
  </View>
);
const styles = StyleSheet.create({
  edge: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', gap: 3 },
  mark: { width: 36, height: 3 },
  accent: { width: 16, height: 3, backgroundColor: colors.sprout.sun },
  rule: { flex: 1, height: 1, backgroundColor: colors.border },
});
