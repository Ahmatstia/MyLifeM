import React from 'react';
import { Platform, Switch, type SwitchProps } from 'react-native';
import { colors } from '@/theme/colors';

export function AppSwitch(props: SwitchProps) {
  return <Switch trackColor={{ false: colors.outlineVariant, true: colors.primary }}
    thumbColor={colors.surfaceContainerLowest} {...props}
    {...(Platform.OS === 'web' ? { activeThumbColor: props.thumbColor ?? colors.surfaceContainerLowest } : {})} />;
}
