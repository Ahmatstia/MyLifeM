import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  BellRing,
  Target,
  CalendarDays,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, space } from '@/theme/tokens';
import { AppText } from './app-text';

const s = colors.sprout;

let externalOpenListener: (() => void) | null = null;

export function registerSidebarOpener(fn: (() => void) | null): void {
  externalOpenListener = fn;
}

export function openAppSidebar(): void {
  externalOpenListener?.();
}

export interface AppSidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const AppSidebarDrawer: React.FC<AppSidebarDrawerProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(316, Math.round(width * 0.82));
  const [slideAnim] = useState(() => new Animated.Value(-drawerWidth));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-drawerWidth);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 240,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, drawerWidth, slideAnim, fadeAnim]);

  if (!visible) return null;

  const navigateTo = (href: string) => {
    onClose();
    setTimeout(() => {
      router.push(href as any);
    }, 60);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Instant Soft Dimmed Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup menu samping"
          />
        </Animated.View>

        {/* Left-Side Storybook Drawer Panel */}
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              width: drawerWidth,
              paddingTop: insets.top + space[3],
              paddingBottom: Math.max(insets.bottom, space[4]),
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerIdentityRow}>
              <View style={styles.monogram}><AppText style={styles.monogramText}>m.</AppText></View>
              <View style={styles.headerTexts}>
                <AppText style={styles.drawerTitle}>Menu MyLife</AppText>
                <AppText style={styles.drawerSubtitle}>
                  Fitur & Pengaturan
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup menu"
              style={({ pressed }) => [
                styles.closeCircleBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <X size={18} color={s.ink} strokeWidth={2.5} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            <AppText style={styles.groupHeading}>MENU FITUR</AppText>
            <View style={styles.menuCardGroup}>
              <SidebarMenuItem
                icon={BellRing}
                iconBg={s.sunSoft}
                iconColor={s.forest}
                title="Manajemen Tugas & Alarm"
                subtitle="Jadwal kerja dan pengingat"
                onPress={() => navigateTo('/task-manager')}
              />

              <SidebarMenuItem
                icon={Target}
                iconBg={s.tealSoft}
                iconColor={s.forest}
                title="Target & Peta Jalan"
                subtitle="Tujuan, tahapan, dan progres"
                onPress={() => navigateTo('/(tabs)/targets')}
              />

              <SidebarMenuItem
                icon={CalendarDays}
                iconBg={s.leafSoft}
                iconColor={s.forest}
                title="Kalender & Jadwal Rutin"
                subtitle="Agenda harian, kalender bulanan & rutinitas"
                onPress={() => navigateTo('/(tabs)/agenda')}
              />

              <SidebarMenuItem
                icon={Settings}
                iconBg={s.sunSoft}
                iconColor={s.ink}
                title="Pengaturan"
                subtitle="Lokasi azan, kategori, durasi fokus & cadangan"
                onPress={() => navigateTo('/settings')}
              />
            </View>
          </ScrollView>

          {/* Footer Sprout Badge pinned neatly at bottom */}
          <View style={styles.sidebarFooter}>
            <View style={styles.footerRow}>
              <ShieldCheck size={22} color={s.forest} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.footerTitle}>
                  100% Tersimpan di Perangkat
                </AppText>
                <AppText style={styles.footerSub}>
                  Privasi penuh tanpa server pihak ketiga
                </AppText>
              </View>
              <ShieldCheck size={18} color={s.forest} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface SidebarMenuItemProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
    style={({ pressed }) => [
      styles.menuItemRow,
      pressed && styles.menuItemPressed,
    ]}
  >
    <View style={[styles.menuIconBox, { backgroundColor: iconBg }]}>
      <Icon size={20} color={iconColor} strokeWidth={2.3} />
    </View>
    <View style={styles.menuItemTextCol}>
      <AppText style={styles.menuItemTitle}>{title}</AppText>
      <AppText style={styles.menuItemSub} numberOfLines={1}>
        {subtitle}
      </AppText>
    </View>
    <ChevronRight size={17} color={s.inkMuted} strokeWidth={2.3} />
  </Pressable>
);

const styles = StyleSheet.create({
  monogram: { width: 38, height: 38, borderRadius: 10, backgroundColor: s.forest, alignItems: 'center', justifyContent: 'center' },
  monogramText: { fontFamily: fontFamily.bold, fontSize: 22, color: s.sun },
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 46, 38, 0.45)',
  },
  drawerPanel: {
    height: '100%',
    backgroundColor: s.cream,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: space[4],
    gap: space[3],
    borderRightWidth: 1,
    borderColor: '#E8DFCA',
    shadowColor: '#0E2E26',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space[1],
  },
  headerIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    flex: 1,
  },
  headerTexts: {
    gap: 2,
    flex: 1,
  },
  drawerTitle: { fontFamily: fontFamily.bold, fontSize: 17, lineHeight: 24, color: s.ink, },
  drawerSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  closeCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: s.card,
    borderWidth: 1,
    borderColor: '#DDE3D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: space[4],
    gap: space[2],
  },
  groupHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    color: s.inkMuted,
    marginTop: space[1],
    marginLeft: 4,
  },
  menuCardGroup: { borderTopWidth: 1, borderTopColor: colors.border, gap: 0, },
  menuItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, },
  menuItemPressed: {
    backgroundColor: '#F5EFE2',
  },
  menuIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', },
  menuItemTextCol: {
    flex: 1,
    gap: 2,
  },
  menuItemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  menuItemSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: s.inkMuted,
  },
  sidebarFooter: {
    backgroundColor: '#EEF0E8',
    borderRadius: 20,
    paddingHorizontal: space[3],
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5DEC9',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  footerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  footerSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: s.inkMuted,
  },
});
