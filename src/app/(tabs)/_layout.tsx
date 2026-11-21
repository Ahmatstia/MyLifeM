import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Home, Target, CalendarDays, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily } from '@/theme/tokens';
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
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: bottomInset + 4,
            paddingTop: 4,
            paddingHorizontal: 10,
            shadowColor: '#0E2E26',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.03,
            shadowRadius: 16,
            elevation: 2,
          },
          tabBarActiveTintColor: s.forest,
          tabBarInactiveTintColor: s.inkMuted,
          tabBarItemStyle: {
            borderRadius: 16,
            marginVertical: 0,
            marginHorizontal: 2,
            paddingVertical: 0,
          },
          tabBarIconStyle: { width: 24, height: 24 },
          tabBarLabelStyle: {
            fontSize: 10,
            lineHeight: 14,
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
