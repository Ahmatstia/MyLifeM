import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlatformPressable } from 'expo-router/react-navigation';
import type { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { todayColors as c } from '@/theme/today';
import { touchTarget } from '@/theme/tokens';

export function BottomNavButton(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      testID={props.testID ?? "bottom-nav-tab"}
      pressOpacity={1}
      pressColor="transparent"
      android_ripple={{ color: 'transparent', borderless: false }}
      hoverEffect={{ color: 'transparent', hoverOpacity: 0, activeOpacity: 0 }}
      style={[props.style, styles.button]}
    />
  );
}

interface BottomNavIconProps {
  icon: LucideIcon;
  focused: boolean;
  tint: string;
}

export function BottomNavIcon({ icon: Icon, focused, tint }: BottomNavIconProps) {
  return (
    <View style={[styles.icon, focused && { backgroundColor: tint, transform: [{ rotate: '-6deg' }] }]}>
      <Icon size={22} color={focused ? c.ink : c.muted} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: touchTarget.min, backgroundColor: 'transparent', borderRadius: 20 },
  icon: { width: 38, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
