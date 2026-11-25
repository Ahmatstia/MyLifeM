/**
 * MyLife Mobile Design System - Layout, Spacing, and Geometry Tokens
 * Conforms to Android 48dp touch target guidelines and 4-point spacing grid.
 */

export const space = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const;

export const layout = {
  phoneGutter: space[4],
  wideGutter: space[6],
  wideBreakpoint: 600,
  maxWidth: 640,
  screenTop: space[3],
  sectionGap: space[4],
  fieldGap: space[2],
} as const;

export function screenGutter(width: number) {
  return width >= layout.wideBreakpoint ? layout.wideGutter : layout.phoneGutter;
}

export const radius = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
  full: 9999,
} as const;

/**
 * Elevasi netral; hierarki mengandalkan komposisi dan bidang warna.
 */
export const elevation = {
  level1: {
    shadowColor: '#332538',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  level2: {
    shadowColor: '#332538',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  level3: {
    shadowColor: '#332538',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
} as const;

/** Plus Jakarta Sans: compact editorial hierarchy, using the existing bundled fonts. */
export const fontFamily = {
  display: 'Fredoka_500Medium',
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
  headlineLarge: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  headlineMedium: { fontSize: 21, lineHeight: 27, fontWeight: '600' as const },
  headlineSmall: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  titleLarge: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, lineHeight: 18, fontWeight: '500' as const },
  labelSmall: { fontSize: 12, lineHeight: 18, fontWeight: '500' as const },
  badge: { fontSize: 12, lineHeight: 18, fontWeight: '600' as const },
  timer: { fontSize: 56, lineHeight: 64, fontWeight: '700' as const },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Icon outlines stay legible when the tap surface grows with system text. */
export const iconSize = { detail: 12, small: 16, standard: 20, large: 24, feature: 32 } as const;
export const stroke = { hairline: 1, selected: 2, icon: 2, strong: 2.5 } as const;
export const interaction = { pressedOpacity: 0.8, disabledOpacity: 0.55, duration: 200 } as const;
