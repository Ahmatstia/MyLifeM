import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';

export interface TabFabButtonProps {
  onPress: () => void;
}

export const TabFabButton: React.FC<TabFabButtonProps> = ({ onPress }) => (
  <View style={styles.slot} pointerEvents="box-none">
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Tambah baru"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Plus size={space[6]} color={colors.onHighlight} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.lg,
    borderTopRightRadius: radius.xxl,
    borderBottomWidth: space[1],
    borderColor: colors.sprout.sunDeep,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.sprout.sunDeep },
});
