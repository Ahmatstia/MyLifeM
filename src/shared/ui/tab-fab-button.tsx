import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { todayColors as c } from '@/theme/today';
import { space, touchTarget } from '@/theme/tokens';

export interface TabFabButtonProps {
  onPress: () => void;
}

export const TabFabButton: React.FC<TabFabButtonProps> = ({ onPress }) => (
  <View style={styles.slot} pointerEvents="box-none">
    <Pressable
      onPress={onPress}
      testID="bottom-nav-add"
      accessibilityRole="button"
      accessibilityLabel="Tambah baru"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Plus size={space[6]} color={c.ink} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: 18,
    borderTopRightRadius: 23,
    transform: [{ rotate: '-6deg' }],
    borderBottomWidth: space[1],
    borderColor: '#DF9778',
    backgroundColor: '#FFC6A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ rotate: '-6deg' }, { translateY: 2 }] },
});
