import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Home, Target, CalendarDays, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily, typography, space, radius, stroke } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { TabFabButton } from '@/shared/ui/tab-fab-button';
import {
  AppSidebarDrawer,
  registerSidebarOpener,
} from '@/shared/ui/app-sidebar-drawer';

const s = colors.sprout;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const bottomInset = Math.max(0, insets.bottom);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    registerSidebarOpener(() => setIsSidebarVisible(true));
    return () => registerSidebarOpener(null);
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 60 + bottomInset + Math.max(0, fontScale - 1) * 16,
            backgroundColor: s.card,
            borderTopLeftRadius: radius.none,
            borderTopRightRadius: radius.none,
            borderTopWidth: stroke.hairline,
            borderTopColor: colors.border,
            paddingBottom: bottomInset + 4,
            paddingTop: space[1],
            paddingHorizontal: space[2],
            shadowColor: colors.onSurface,
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.03,
            shadowRadius: 16,
            elevation: 2,
          },
          tabBarActiveTintColor: s.forest,
          tabBarInactiveTintColor: s.inkMuted,
          tabBarItemStyle: {
            borderRadius: radius.lg,
            marginVertical: 0,
            marginHorizontal: space[0.5],
            paddingVertical: 0,
          },
          tabBarIconStyle: { width: 24, height: 24 },
          tabBarLabelStyle: {
            fontSize: typography.labelSmall.fontSize,
            lineHeight: typography.labelSmall.lineHeight,
            fontFamily: fontFamily.bold,
            marginTop: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hari Ini',
            tabBarIcon: ({ color, size }) => (
              <Home size={size || 22} color={color} strokeWidth={2.4} />
            ),
          }}
        />
        <Tabs.Screen
          name="targets"
          options={{
            title: 'Target',
            tabBarIcon: ({ color, size }) => (
              <Target size={size || 22} color={color} strokeWidth={2.4} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Tambah',
            tabBarButton: () => (
              <TabFabButton onPress={() => router.push('/quick-add' as any)} />
            ),
          }}
        />
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <CalendarDays size={size || 22} color={color} strokeWidth={2.4} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <Menu size={size || 22} color={color} strokeWidth={2.4} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setIsSidebarVisible(true);
            },
          }}
        />
        <Tabs.Screen name="projects" options={{ href: null }} />
      </Tabs>

      <AppSidebarDrawer
        visible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />
    </>
  );
}
