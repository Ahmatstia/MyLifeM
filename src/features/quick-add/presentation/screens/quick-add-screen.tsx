import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  BellRing,
  Target,
  Calendar,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, touchTarget } from '@/theme/tokens';
import { AppText } from '@/shared/ui';

type QuickAddItem = {
  id: string;
  label: string;
  subtitle: string;
  pathname: string;
  icon: LucideIcon;
};

const ITEMS: QuickAddItem[] = [
  {
    id: 'priority',
    label: 'Tugas Hari Ini',
    subtitle: 'Pilih satu tugas untuk dikerjakan hari ini.',
    pathname: '/today/new',
    icon: CheckCircle2,
  },
  {
    id: 'task-manager',
    label: 'Tugas & Alarm',
    subtitle: 'Tentukan tenggat dan jam pengingat.',
    pathname: '/task-manager/new',
    icon: BellRing,
  },
  {
    id: 'target',
    label: 'Target Hidup',
    subtitle: 'Susun tujuan dengan tahapan dan tugas.',
    pathname: '/targets/new',
    icon: Target,
  },
  {
    id: 'agenda',
    label: 'Agenda & Kalender',
    subtitle: 'Catat kegiatan pada tanggal tertentu.',
    pathname: '/agenda/new',
    icon: Calendar,
  },
];

export const QuickAddScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const handleSelect = (item: QuickAddItem) => {
    router.replace(item.pathname as any);
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.scrim}
        onPress={() => router.back()}
        accessibilityLabel="Tutup"
      />

      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, space[5]) + space[3] },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="headlineLarge" accessibilityRole="header" style={styles.sheetTitle}>Tambahkan</AppText>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Tutup"
            style={({ pressed }) => [styles.closeButton, pressed && styles.actionRowPressed]}
          >
            <X size={space[5]} color={colors.onSurface} />
          </Pressable>
        </View>

        <ScrollView style={styles.actionScroll} showsVerticalScrollIndicator={false}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.actionRowPressed,
              ]}
            >
              <item.icon size={space[6]} color={colors.primary} />
              <View style={styles.actionCopy}>
                <AppText variant="titleMedium">{item.label}</AppText>
                <AppText variant="bodyMedium" color="onSurfaceVariant">
                  {item.subtitle}
                </AppText>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space[5],
    paddingTop: space[4],
  },
  actionScroll: { flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2], marginBottom: space[2] },
  sheetTitle: { flex: 1 },
  closeButton: { width: touchTarget.min, height: touchTarget.min, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  actionRow: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingVertical: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  actionRowPressed: { backgroundColor: colors.surfaceContainer },
  actionCopy: { flex: 1, gap: space[1] },
});
