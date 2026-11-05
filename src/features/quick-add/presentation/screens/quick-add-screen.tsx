import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Target,
  FolderKanban,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';

type QuickAddItem = {
  id: string;
  label: string;
  subtitle: string;
  pathname: '/' | '/targets' | '/projects' | '/agenda';
  icon: React.ReactNode;
};

const ITEMS: QuickAddItem[] = [
  {
    id: 'priority',
    label: 'Tugas Prioritas',
    subtitle: 'Tugas fokus hari ini',
    pathname: '/',
    icon: <CheckCircle2 size={19} color={colors.primary} />,
  },
  {
    id: 'target',
    label: 'Target Hidup',
    subtitle: 'Sasaran & roadmap strategis',
    pathname: '/targets',
    icon: <Target size={19} color={colors.primary} />,
  },
  {
    id: 'project',
    label: 'Proyek Baru',
    subtitle: 'Rencana kerja & inisiatif',
    pathname: '/projects',
    icon: <FolderKanban size={19} color={colors.primary} />,
  },
  {
    id: 'agenda',
    label: 'Agenda',
    subtitle: 'Jadwal dan pengingat waktu',
    pathname: '/agenda',
    icon: <Calendar size={19} color={colors.primary} />,
  },
];

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

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + space[3] }]}>
        {/* Drag Handle */}
        <View style={styles.handleStrip}>
          <View style={styles.handle} />
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <AppText variant="headlineSmall" style={styles.sheetTitle}>
                Tambah Cepat
              </AppText>
            </View>
            <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.sheetSubtitle}>
              Pilih apa yang ingin kamu tambahkan ke ritme hidupmu
            </AppText>
          </View>

          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Tutup"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.closeButton}
          >
            <X size={20} color={colors.onSurface} />
          </Pressable>
        </View>

        <View style={styles.actionList}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.bentoCardPressed,
              ]}
            >
              <View style={styles.iconTile}>{item.icon}</View>
              <View style={styles.actionCopy}>
                <AppText variant="titleSmall" style={styles.actionTitle}>{item.label}</AppText>
                <AppText
                  variant="bodySmall"
                  color="onSurfaceVariant"
                  numberOfLines={1}
                >
                  {item.subtitle}
                </AppText>
              </View>
              <ChevronRight size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          ))}
        </View>

        {/* Cancel Button */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Batal"
          style={styles.cancelButton}
        >
          <AppText variant="labelMedium" color="onSurfaceVariant">
            Batal
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: space[4], paddingTop: space[2] },
  handleStrip: { minHeight: 24, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: colors.outlineVariant },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[3] },
  headerLeft: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  sheetTitle: { fontSize: 19, color: colors.onSurface },
  sheetSubtitle: { fontSize: 12, color: colors.onSurfaceVariant },
  closeButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  actionList: { gap: space[2] },
  actionRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: space[3], paddingVertical: space[2], backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, borderWidth: 1, borderColor: colors.outlineVariant },
  iconTile: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, gap: 1 },
  actionTitle: { fontFamily: fontFamily.semibold, color: colors.onSurface },
  bentoCardPressed: { backgroundColor: colors.surfaceContainerLow },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: space[2] },
});
