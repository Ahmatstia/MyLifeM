import React from 'react';
import { View, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
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
import { layout, screenGutter, fontFamily, space, radius, touchTarget } from '@/theme/tokens';
import { AppText } from '@/shared/ui';

type QuickAddItem = {
  id: string;
  label: string;
  subtitle: string;
  pathname: string;
  icon: LucideIcon;
  color: string;
};

const ITEMS: QuickAddItem[] = [
  {
    id: 'priority',
    label: 'Tugas Hari Ini',
    subtitle: 'Pilih satu tugas untuk dikerjakan hari ini.',
    pathname: '/today/new',
    icon: CheckCircle2,
    color: colors.clockFace,
  },
  {
    id: 'task-manager',
    label: 'Tugas & Alarm',
    subtitle: 'Tentukan tenggat dan jam pengingat.',
    pathname: '/task-manager/new',
    icon: BellRing,
    color: colors.folderPeach,
  },
  {
    id: 'target',
    label: 'Target Hidup',
    subtitle: 'Susun tujuan dengan tahapan dan tugas.',
    pathname: '/targets/new',
    icon: Target,
    color: colors.folderLilac,
  },
  {
    id: 'agenda',
    label: 'Agenda & Kalender',
    subtitle: 'Catat kegiatan pada tanggal tertentu.',
    pathname: '/agenda/new',
    icon: Calendar,
    color: colors.folderMint,
  },
];

export const QuickAddScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const handleSelect = (item: QuickAddItem) => {
    router.replace(item.pathname as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <Pressable
        accessible={false} focusable={false} tabIndex={-1}
        style={styles.scrim}
        onPress={() => router.back()}
        accessibilityLabel="Tutup"
      />

      <View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + space[4], paddingHorizontal: screenGutter(width - insets.left - insets.right) },
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
                item.id === 'priority' && styles.quickTask,
                pressed && styles.actionRowPressed,
              ]}
            >
              <View style={[styles.keyCap, { backgroundColor: item.color }]}><item.icon size={space[5]} color={colors.clockInk} /></View>
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
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingTop: space[4],
  },
  actionScroll: { flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2], marginBottom: space[2] },
  sheetTitle: { flex: 1, fontFamily: fontFamily.display },
  closeButton: { width: touchTarget.min, height: touchTarget.min, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  actionRow: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[3],
    marginBottom: space[2],
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
  },
  actionRowPressed: { backgroundColor: colors.surfaceContainer },
  quickTask: { backgroundColor: colors.clockCase, borderRadius: radius.lg, paddingHorizontal: space[3], marginBottom: space[1], borderBottomWidth: 0 },
  keyCap: { width: space[10], height: space[10], borderRadius: radius.md, borderTopRightRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, gap: space[1] },
});
