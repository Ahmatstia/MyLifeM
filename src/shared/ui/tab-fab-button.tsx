import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';

const s = colors.sprout;

export interface TabFabButtonProps {
  onPress: () => void;
}

export const TabFabButton: React.FC<TabFabButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.slot} pointerEvents="box-none">
      <View style={styles.cradle}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Tambah baru"
          style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        >
          <Svg width={26} height={26} viewBox="0 0 26 26">
            {/* 4-point sparkle/plus star like the reference UI */}
            <Path
              d="M13 3 C13.8 8.8 17.2 12.2 23 13 C17.2 13.8 13.8 17.2 13 23 C12.2 17.2 8.8 13.8 3 13 C8.8 12.2 12.2 8.8 13 3 Z"
              fill={s.ink}
              stroke={s.ink}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            <Circle cx={20} cy={6} r={1.5} fill={s.ink} />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cradle: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', },
  fab: { width: 46, height: 46, borderRadius: 14, backgroundColor: s.sun, alignItems: 'center', justifyContent: 'center', },
  pressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: s.sunDeep,
  },
});
