import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Target, FolderKanban, Calendar, ChevronRight, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';

type QuickAddItem = {
  label: string;
  description: string;
  pathname: '/' | '/targets' | '/projects' | '/agenda';
  icon: React.ReactNode;
};

const ITEMS: QuickAddItem[] = [
  {
    label: 'Prioritas hari ini',
    description: 'Tugas yang ingin kamu selesaikan hari ini',
    pathname: '/',
    icon: <CheckCircle2 size={24} color={colors.primary} />,
  },
  {
    label: 'Target hidup',
    description: 'Arah besar di salah satu pilar kehidupan',
    pathname: '/targets',
    icon: <Target size={24} color={colors.primary} />,
  },
  {
    label: 'Proyek',
    description: 'Wadah kerja dengan babak dan tugas',
    pathname: '/projects',
    icon: <FolderKanban size={24} color={colors.primary} />,
  },
  {
    label: 'Agenda',
    description: 'Kegiatan terjadwal atau bebas jam',
    pathname: '/agenda',
    icon: <Calendar size={24} color={colors.primary} />,
  },
];

/**
 * Sheet "Tambah" dari FAB tengah nav bar (DESIGN.md 7.15: bottom sheet, item 56 dp+).
 * Memilih item membuka tab tujuan dengan parameter `add=1` sehingga form-nya langsung terbuka.
 */
export const QuickAddScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const handleSelect = (item: QuickAddItem) => {
    router.back();
    setTimeout(() => {
      router.navigate({ pathname: item.pathname, params: { add: '1' } } as any);
    }, 0);
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.scrim}
        onPress={() => router.back()}
        accessibilityLabel="Tutup"
      />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + space[4] }]}>
        <View style={styles.handleStrip}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <AppText variant="titleLarge">Tambah baru</AppText>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Tutup"
            style={styles.closeButton}
          >
            <X size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {ITEMS.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => handleSelect(item)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.iconTile}>{item.icon}</View>
            <View style={styles.rowText}>
              <AppText variant="titleMedium">{item.label}</AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={2}>
                {item.description}
              </AppText>
            </View>
            <ChevronRight size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: space[4],
  },
  handleStrip: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.onSurfaceVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -space[3],
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[2],
    borderRadius: radius.lg,
  },
  rowPressed: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[4],
  },
  rowText: {
    flex: 1,
    marginRight: space[2],
  },
});
