import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './app-text';
import { space } from '@/theme/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <AppText variant="bodySmall" color="onSurfaceVariant">{subtitle}</AppText>
        <AppText variant="headlineLarge" accessibilityRole="header">{title}</AppText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[3], marginTop: space[4], marginBottom: space[6] },
  text: { flex: 1, minWidth: 160, gap: space[1] },
});
