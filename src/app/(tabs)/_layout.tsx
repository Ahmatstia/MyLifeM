import React from 'react';
import { Tabs, router } from 'expo-router';
import { Sparkles, Sprout, Shapes, CalendarHeart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily } from '@/theme/tokens';
import { TabFabButton } from '@/shared/ui/tab-fab-button';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(16, insets.bottom + 6);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomInset,
          left: 16,
          right: 16,
          height: 64,
          backgroundColor: '#151718',
          borderRadius: 32,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 6,
          paddingTop: 6,
          paddingHorizontal: 6,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 12,
        },
        tabBarActiveTintColor: '#151718',
        tabBarActiveBackgroundColor: '#DCF763',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        tabBarItemStyle: {
          borderRadius: 24,
          marginVertical: 4,
          marginHorizontal: 3,
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: fontFamily.bold,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hari Ini',
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size || 20} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Target',
          tabBarIcon: ({ color, size }) => (
            <Sprout size={size || 20} color={color} strokeWidth={2.4} />
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
            <Shapes size={size || 20} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <CalendarHeart size={size || 20} color={color} strokeWidth={2.4} />
          ),
        }}
      />
    </Tabs>
  );
}
