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
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 30,
  pill: 9999,
  full: 9999,
} as const;

/**
 * Elevasi netral; hierarki mengandalkan komposisi dan bidang warna.
 */
export const elevation = {
  level1: {
    shadowColor: '#173C36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  level2: {
    shadowColor: '#173C36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  level3: {
    shadowColor: '#173C36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
} as const;

/** Plus Jakarta Sans statis per bobot (DESIGN.md Bagian 4.2). */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const touchTarget = {
  min: 48,
  comfortable: 56,
  compact: 48,
} as const;

export const typography = {
  displayLarge: { fontSize: 36, lineHeight: 44, fontWeight: '700' as const },
  displayMedium: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  headlineLarge: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  headlineMedium: { fontSize: 24, lineHeight: 30, fontWeight: '600' as const },
  headlineSmall: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, lineHeight: 18, fontWeight: '500' as const },
  labelSmall: { fontSize: 12, lineHeight: 18, fontWeight: '500' as const },
  badge: { fontSize: 12, lineHeight: 18, fontWeight: '600' as const },
  timer: { fontSize: 56, lineHeight: 64, fontWeight: '700' as const },
} as const;

export type TypographyVariant = keyof typeof typography;
