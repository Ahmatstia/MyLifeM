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
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { AppText, IconTile } from '@/shared/ui';

const s = colors.sprout;

type QuickAddItem = {
  id: string;
  label: string;
  subtitle: string;
  pathname: string;
  icon: LucideIcon;
  tone: 'leaf' | 'teal' | 'grape' | 'sun';
};

const ITEMS: QuickAddItem[] = [
  {
    id: 'priority',
    label: 'Tugas Hari Ini',
    subtitle: 'Fokus harian yang ingin diselesaikan',
    pathname: '/today/new',
    icon: CheckCircle2,
    tone: 'leaf',
  },
  {
    id: 'task-manager',
    label: 'Tugas & Alarm',
    subtitle: 'Atur waktu kerja dan pengingat',
    pathname: '/task-manager/new',
    icon: BellRing,
    tone: 'grape',
  },
  {
    id: 'target',
    label: 'Target Hidup',
    subtitle: 'Tujuan besar, dipecah jadi langkah',
    pathname: '/targets/new',
    icon: Target,
    tone: 'teal',
  },
  {
    id: 'agenda',
    label: 'Agenda & Kalender',
    subtitle: 'Jadwal kegiatan dan pengingat waktu',
    pathname: '/agenda/new',
    icon: Calendar,
    tone: 'sun',
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
          { paddingBottom: Math.max(insets.bottom, 20) + space[3] },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText style={styles.sheetTitle}>Apa langkah berikutnya?</AppText>
            <AppText style={styles.sheetSubtitle}>
              Tangkap ide, lalu beri tempat.
            </AppText>
          </View>

          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Tutup"
            hitSlop={8}
            style={styles.closeButton}
          >
            <X size={20} color={s.ink} />
          </Pressable>
        </View>

        <ScrollView style={styles.actionScroll} contentContainerStyle={styles.actionList} showsVerticalScrollIndicator={false}>
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
              <IconTile icon={item.icon} tone={item.tone} size={36} />
              <View style={styles.actionCopy}>
                <AppText style={styles.actionTitle}>{item.label}</AppText>
                <AppText style={styles.actionSub}>
                  {item.subtitle}
                </AppText>
              </View>
              <ChevronRight size={18} color={s.inkMuted} />
            </Pressable>
          ))}
        </ScrollView>
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
  sheet: { maxHeight: '92%', backgroundColor: s.cream, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 20, },
  actionScroll: { flexShrink: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 28, letterSpacing: -0.5, color: s.ink, },
  sheetSubtitle: { fontFamily: fontFamily.regular, fontSize: 12, color: s.inkMuted, },
  closeButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: s.card, alignItems: 'center', justifyContent: 'center', },
  actionList: { gap: 0, },
  actionRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, },
  actionRowPressed: {
    transform: [{ scale: 0.985 }],
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: s.ink,
  },
  actionSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
});
