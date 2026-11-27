import React, { useState, useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Home, ListTodo, CalendarDays, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily, typography, space, layout } from '@/theme/tokens';
import { todayColors as c } from '@/theme/today';
import { BottomNavButton, BottomNavIcon } from '@/shared/ui/bottom-nav-button';
import { TabFabButton } from '@/shared/ui/tab-fab-button';
import {
  AppSidebarDrawer,
  registerSidebarOpener,
} from '@/shared/ui/app-sidebar-drawer';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const bottomInset = Math.max(0, insets.bottom);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    registerSidebarOpener(() => setIsSidebarVisible(true));
    return () => registerSidebarOpener(null);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarButton: (props) => <BottomNavButton {...props} />,
          tabBarStyle: {
            width: Math.min(width - insets.left - insets.right - space[6], layout.maxWidth),
            alignSelf: 'center',
            height: 70 + Math.max(0, fontScale - 1) * 20,
            marginBottom: bottomInset + space[2],
            marginTop: space[1],
            backgroundColor: c.card,
            borderRadius: 28,
            borderWidth: 1,
            borderTopWidth: 1,
            borderColor: c.line,
            paddingBottom: space[1],
            paddingTop: space[1],
            paddingHorizontal: space[1],
            shadowColor: c.ink,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 12,
            elevation: 3,
          },
          tabBarActiveTintColor: c.ink,
          tabBarActiveBackgroundColor: 'transparent',
          tabBarInactiveTintColor: c.muted,
          tabBarInactiveBackgroundColor: 'transparent',
          tabBarLabelPosition: 'below-icon',
          tabBarItemStyle: { marginHorizontal: 0 },
          tabBarIconStyle: { width: 38, height: 30 },
          tabBarLabelStyle: {
            fontSize: typography.labelSmall.fontSize,
            lineHeight: typography.labelSmall.lineHeight,
            fontFamily: fontFamily.display,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hari Ini',
            tabBarIcon: ({ focused }) => (
              <BottomNavIcon icon={Home} focused={focused} tint={c.gold} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tugas',
            tabBarIcon: ({ focused }) => (
              <BottomNavIcon icon={ListTodo} focused={focused} tint={c.lilac} />
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
            title: 'Kalender',
            tabBarIcon: ({ focused }) => (
              <BottomNavIcon icon={CalendarDays} focused={focused} tint={c.sky} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ focused }) => (
              <BottomNavIcon icon={Menu} focused={focused} tint={c.mint} />
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
    </View>
  );
}
