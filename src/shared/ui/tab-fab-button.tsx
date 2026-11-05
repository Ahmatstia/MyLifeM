import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';

export interface TabFabButtonProps {
  onPress: () => void;
}

export const TabFabButton: React.FC<TabFabButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.slot} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Tambah baru"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Plus size={22} color="#FAF5EB" strokeWidth={3} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E06B52', // Terracotta Coral
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E1E2E', // Deep Blueberry Ink
    boxShadow: '2px 2px 0px #1E1E2E',
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.94 }, { translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
});

