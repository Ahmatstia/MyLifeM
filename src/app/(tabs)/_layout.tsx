import React from 'react';
import { Tabs, router } from 'expo-router';
import { Target, CheckCircle2, FolderKanban, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/tokens';
import { TabFabButton } from '@/shared/ui/tab-fab-button';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          overflow: 'visible',
          shadowColor: colors.hero,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarActiveBackgroundColor: colors.primaryContainer,
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 2 },
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fontFamily.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hari Ini',
          tabBarIcon: ({ color, size }) => (
            <CheckCircle2 size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Target',
          tabBarIcon: ({ color, size }) => (
            <Target size={size || 22} color={color} />
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
            <FolderKanban size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
