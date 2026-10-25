import React from 'react';
import { Text, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily, typography, type TypographyVariant } from '@/theme/tokens';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors | string;
  align?: 'left' | 'center' | 'right';
  tabularNums?: boolean;
}

// Di RN, bobot font kustom dipilih lewat nama keluarga font, bukan fontWeight (DESIGN.md L4).
const FAMILY_BY_WEIGHT: Record<string, string> = {
  '400': fontFamily.regular,
  '500': fontFamily.medium,
  '600': fontFamily.semibold,
  '700': fontFamily.bold,
};

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'bodyMedium',
  color = 'onSurface',
  align = 'left',
  tabularNums = false,
  style,
  ...props
}) => {
  const typoStyle = typography[variant] || typography.bodyMedium;
  const resolvedColor =
    typeof color === 'string' && color in colors
      ? (colors as Record<string, any>)[color]
      : color;

  const flattenedStyle = (StyleSheet.flatten(style) || {}) as TextStyle;
  const finalColor = flattenedStyle.color || resolvedColor || colors.onSurface;

  const combinedStyle: TextStyle = {
    fontSize: typoStyle.fontSize,
    lineHeight: typoStyle.lineHeight,
    fontFamily: FAMILY_BY_WEIGHT[typoStyle.fontWeight] ?? fontFamily.regular,
    textAlign: align,
    ...(tabularNums ? { fontVariant: ['tabular-nums'] } : {}),
    ...flattenedStyle,
    color: finalColor,
  };

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};
