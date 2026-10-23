/**
 * MyLife Mobile Design System - Layout, Spacing, and Geometry Tokens
 * Conforms to Android 48dp touch target guidelines and 4-point spacing grid.
 */

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 28,
  full: 9999,
} as const;

export const touchTarget = {
  min: 48,
  comfortable: 56,
  compact: 40,
} as const;

export const typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  badge: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },
  timer: { fontSize: 56, lineHeight: 64, fontWeight: '700' as const },
} as const;
