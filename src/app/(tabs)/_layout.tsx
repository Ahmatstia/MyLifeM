import React from 'react';
import { Tabs } from 'expo-router';
import { Target, CheckCircle2, FolderKanban, Calendar } from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
