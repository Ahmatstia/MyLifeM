import React from 'react';
import { Tabs, router } from 'expo-router';
import { CheckCircle2, Target, FolderKanban, CalendarDays } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily } from '@/theme/tokens';
import { TabFabButton } from '@/shared/ui/tab-fab-button';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(0, insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 62 + bottomInset,
          backgroundColor: '#FAF5EB',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderWidth: 1.5,
          borderColor: '#1E1E2E',
          borderBottomWidth: 0,
          paddingBottom: bottomInset,
          paddingTop: 6,
          paddingHorizontal: 8,
          boxShadow: '0px -2px 0px rgba(30, 30, 46, 0.06)',
        },
        tabBarActiveTintColor: '#E06B52',
        tabBarInactiveTintColor: '#504535',
        tabBarItemStyle: {
          borderRadius: 14,
          marginVertical: 2,
          marginHorizontal: 1,
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
            <CheckCircle2 size={size || 20} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Target',
          tabBarIcon: ({ color, size }) => (
            <Target size={size || 20} color={color} strokeWidth={2.4} />
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
            <FolderKanban size={size || 20} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size || 20} color={color} strokeWidth={2.4} />
          ),
        }}
      />
    </Tabs>
  );
}
