import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  Sprout,
  FolderKanban,
  Calendar,
  X,
  Zap,
  Check,
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
  bgColor: string;
  textColor: string;
  subColor: string;
  iconBg: string;
  iconColor: string;
  icon: (color: string) => React.ReactNode;
};

const ITEMS: QuickAddItem[] = [
  {
    id: 'priority',
    label: 'Prioritas',
    subtitle: 'Tugas kilat hari ini',
    pathname: '/',
    bgColor: '#E1DFFF',
    textColor: '#1F1D8A',
    subColor: '#3838A1',
    iconBg: '#FFFFFF',
    iconColor: '#5052BA',
    icon: (c) => <Sparkles size={20} color={c} />,
  },
  {
    id: 'target',
    label: 'Target Hidup',
    subtitle: 'Cita-cita & roadmap',
    pathname: '/targets',
    bgColor: '#FFE8DB',
    textColor: '#6C3A00',
    subColor: '#8F4E00',
    iconBg: '#FFFFFF',
    iconColor: '#8F4E00',
    icon: (c) => <Sprout size={20} color={c} />,
  },
  {
    id: 'project',
    label: 'Proyek Baru',
    subtitle: 'Hasil karya kreatif',
    pathname: '/projects',
    bgColor: '#F4F9D8',
    textColor: '#1A1C1F',
    subColor: '#5A5D66',
    iconBg: '#FFFFFF',
    iconColor: '#1A1C1F',
    icon: (c) => <FolderKanban size={20} color={c} />,
  },
  {
    id: 'agenda',
    label: 'Agenda',
    subtitle: 'Kegiatan kalender',
    pathname: '/agenda',
    bgColor: '#E8E8FF',
    textColor: '#08006C',
    subColor: '#3838A1',
    iconBg: '#FFFFFF',
    iconColor: '#5052BA',
    icon: (c) => <Calendar size={20} color={c} />,
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
              <View style={styles.boltIconWrapper}>
                <Zap size={16} color="#8F4E00" fill="#FFA858" />
              </View>
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

        {/* 2x2 Bento Category Grid */}
        <View style={styles.bentoGrid}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.bentoCard,
                { backgroundColor: item.bgColor },
                pressed && styles.bentoCardPressed,
              ]}
            >
              <View style={styles.bentoTopRow}>
                <View style={[styles.bentoIconTile, { backgroundColor: item.iconBg }]}>
                  {item.icon(item.iconColor)}
                </View>
                <ChevronRight size={16} color={item.textColor} opacity={0.6} />
              </View>

              <View style={styles.bentoTextGroup}>
                <AppText
                  variant="titleMedium"
                  style={[styles.bentoTitle, { color: item.textColor }]}
                >
                  {item.label}
                </AppText>
                <AppText
                  variant="bodySmall"
                  style={[styles.bentoSub, { color: item.subColor }]}
                  numberOfLines={1}
                >
                  {item.subtitle}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Helpful Tip Footer */}
        <View style={styles.tipBox}>
          <View style={styles.tipIcon}>
            <Check size={14} color="#5052BA" />
          </View>
          <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.tipText}>
            Tambahkan 1–3 tindakan nyata hari ini untuk membangun momentum yang konsisten.
          </AppText>
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
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 28, 31, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: space[5],
    paddingTop: space[2],
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 20,
    elevation: 16,
  },
  handleStrip: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: '#C7C5D4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: space[4],
    marginTop: space[1],
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: '#151718',
  },
  boltIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: '#FFDCC1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#55585E',
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: '#EEEDF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
    marginBottom: space[4],
  },
  bentoCard: {
    width: '47.5%',
    borderRadius: radius.xl,
    padding: space[4],
    minHeight: 116,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  bentoCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  bentoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bentoIconTile: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  bentoTextGroup: {
    marginTop: space[2],
  },
  bentoTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
  },
  bentoSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: '#F3F3F7',
    padding: space[3],
    borderRadius: radius.lg,
    marginBottom: space[3],
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: '#E1DFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[2],
  },
});
