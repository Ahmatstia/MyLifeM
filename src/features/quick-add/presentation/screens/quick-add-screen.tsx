import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Target,
  Calendar,
  X,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { AppText, IconTile, MascotHead, sproutShadow } from '@/shared/ui';

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
    id: 'target',
    label: 'Target Hidup',
    subtitle: 'Sasaran, rencana tahapan & peta jalan ekspedisi',
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
        <View style={styles.mascotPeekTop} pointerEvents="none">
          <MascotHead width={128} height={82} />
        </View>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText style={styles.sheetTitle}>Tambah Baru ✨</AppText>
            <AppText style={styles.sheetSubtitle}>
              Pilih apa yang ingin kamu mulai hari ini
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

        <View style={styles.actionList}>
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
              <IconTile icon={item.icon} tone={item.tone} size={44} />
              <View style={styles.actionCopy}>
                <AppText style={styles.actionTitle}>{item.label}</AppText>
                <AppText style={styles.actionSub} numberOfLines={1}>
                  {item.subtitle}
                </AppText>
              </View>
              <ChevronRight size={18} color={s.inkMuted} />
            </Pressable>
          ))}
        </View>
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
    backgroundColor: s.cream,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: space[4],
    paddingTop: space[5],
    position: 'relative',
  },
  mascotPeekTop: {
    position: 'absolute',
    top: -64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
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
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: s.ink,
  },
  sheetSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: s.inkMuted,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: s.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE3D0',
  },
  actionList: {
    gap: space[2],
  },
  actionRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: s.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1EADA',
    ...sproutShadow,
  },
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
