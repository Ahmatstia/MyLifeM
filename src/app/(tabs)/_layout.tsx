import React from 'react';
import { Tabs, router } from 'expo-router';
import { Home, Target, FolderKanban, CalendarDays } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { TabFabButton } from '@/shared/ui/tab-fab-button';

const s = colors.sprout;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(0, insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 68 + bottomInset,
          backgroundColor: s.forest,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopWidth: 0,
          paddingBottom: bottomInset + 4,
          paddingTop: 8,
          paddingHorizontal: 10,
          shadowColor: '#0E2E26',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.16,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8FB9AA',
        tabBarItemStyle: {
          borderRadius: 16,
          marginVertical: 2,
          marginHorizontal: 2,
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: fontFamily.bold,
          marginTop: 2,
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
        name="projects"
        options={{
          title: 'Proyek',
          tabBarIcon: ({ color, size }) => (
            <FolderKanban size={size || 22} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size || 22} color={color} strokeWidth={2.4} />
          ),
        }}
      />
    </Tabs>
  );
}
