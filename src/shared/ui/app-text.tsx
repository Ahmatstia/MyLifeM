import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typography, type TypographyVariant } from '@/theme/tokens';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors | string;
  align?: 'left' | 'center' | 'right';
  tabularNums?: boolean;
}

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

  const combinedStyle: TextStyle = {
    fontSize: typoStyle.fontSize,
    lineHeight: typoStyle.lineHeight,
    fontWeight: typoStyle.fontWeight,
    color: resolvedColor,
    textAlign: align,
    ...(tabularNums ? { fontVariant: ['tabular-nums'] } : {}),
  };

  return (
    <Text style={[combinedStyle, style]} {...props}>
      {children}
    </Text>
  );
};
