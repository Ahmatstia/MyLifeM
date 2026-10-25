import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { elevation, radius } from '@/theme/tokens';

export interface TabFabButtonProps {
  onPress: () => void;
}

/**
 * Tombol tambah di tengah nav bar (referensi UI). FAB 56x56, primary, ikon onPrimary 24.
 * Menjorok 16 dp ke atas dari nav bar agar menjadi satu aksi utama yang jelas.
 */
export const TabFabButton: React.FC<TabFabButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.slot} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Tambah baru"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Plus size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...elevation.level3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
