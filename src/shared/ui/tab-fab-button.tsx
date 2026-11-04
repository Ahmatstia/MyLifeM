import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';

export interface TabFabButtonProps {
  onPress: () => void;
}

/**
 * Tombol tambah di tengah nav bar (Exact Google Stitch Tangerine FAB).
 * Menjorok ke atas dari floating dock agar menjadi aksi utama yang playful.
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
        <Plus size={24} color="#FFFFFF" strokeWidth={3} />
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9E44',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    borderWidth: 3,
    borderColor: '#F7F5EF',
    shadowColor: '#FF9E44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.94 }],
  },
});
