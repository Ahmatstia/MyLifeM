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
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { layout, fontFamily, radius, space, touchTarget, typography } from '@/theme/tokens';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
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
  const reducedMotion = useReducedMotion();
  const [slideAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible || reducedMotion) {
      slideAnim.setValue(0);
      return;
    }
    slideAnim.setValue(-drawerWidth);
    const slide = Animated.timing(slideAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    });
    slide.start();
    return () => slide.stop();
  }, [visible, reducedMotion, drawerWidth, slideAnim]);

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
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessible={false}
            focusable={false}
            tabIndex={-1}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup menu samping"
          />
        </View>
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              width: drawerWidth,
              paddingTop: insets.top + layout.screenTop,
              paddingLeft: layout.phoneGutter + insets.left,
              paddingBottom: insets.bottom + space[4],
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <AppText accessibilityRole="header" variant="titleLarge" style={styles.drawerTitle}>
              Menu MyLife
            </AppText>

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
      <AppText style={styles.menuItemSub}>
        {subtitle}
      </AppText>
    </View>
    <ChevronRight size={17} color={s.inkMuted} strokeWidth={2.3} />
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  drawerPanel: {
    height: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingRight: layout.phoneGutter,
    gap: space[2],
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  drawerTitle: { flex: 1, fontFamily: fontFamily.display, color: colors.onSurface },
  closeCircleBtn: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: { paddingBottom: space[4] },
  menuCardGroup: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  menuItemRow: {
    flexDirection: 'row',
    minHeight: touchTarget.min,
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemPressed: { backgroundColor: colors.surfaceContainerLow },
  menuIconBox: {
    width: space[8],
    height: space[8],
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextCol: { flex: 1, gap: space[1] },
  menuItemTitle: { ...typography.titleSmall, fontFamily: fontFamily.bold, color: s.ink },
  menuItemSub: { ...typography.bodyMedium, fontFamily: fontFamily.regular, color: s.inkMuted },
});
