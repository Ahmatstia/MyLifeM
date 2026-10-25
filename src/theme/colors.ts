/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/DESIGN_V2.md (Botanical Pop).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Warm ivory and neutral reading surfaces.
  background: '#F7F5EF',
  surface: '#F7F5EF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#EEEFE7',
  surfaceContainer: '#E7EBE1',
  surfaceContainerHigh: '#DEE5D8',
  surfaceContainerHighest: '#CCD7C8',

  // Teal actions, petrol hero, citron accent.
  primary: '#125B50',
  primaryHover: '#0D483F',
  primaryContainer: '#DDEDE5',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#153F35',
  hero: '#173C36',
  onHero: '#FFFFFF',
  onHeroMuted: '#DDEDE5',
  heroDecoration: '#31584D',
  heroTrack: '#668A7D',

  // Peach uses dark text for readable labels.
  secondary: '#934329',
  secondaryContainer: '#FFE3D5',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#6C2B18',

  // Tertiary (aksen hangat untuk teks/ikon)
  tertiary: '#236341',
  tertiaryContainer: '#E0F1E6',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#194B31',

  // Highlight (hanya sebagai isi untuk momen spesial, mis. streak)
  highlight: '#D5F478',
  highlightContainer: '#E9F6C5',
  onHighlight: '#293B13',
  onHighlightContainer: '#293B13',

  // Text hierarchy.
  onSurface: '#262D29',
  onSurfaceVariant: '#5D6861',
  onSurfaceSubtle: '#626B62',

  // Border & divider: Whisper-soft borders (no harsh wireframe outlines)
  outline: '#748373',
  outlineVariant: '#DEE3D8',
  border: '#DEE3D8',

  // Status
  success: '#236341',
  successContainer: '#E0F1E6',
  onSuccess: '#FFFFFF',
  onSuccessContainer: '#194B31',

  error: '#A83030',
  errorContainer: '#FFE4E0',
  onError: '#FFFFFF',
  onErrorContainer: '#7B2424',

  warning: '#775016',
  warningContainer: '#FFF0CE',
  onWarning: '#FFFFFF',
  onWarningContainer: '#62400D',

  // Inverse (snackbar)
  inverseSurface: '#173C36',
  inverseOnSurface: '#FFFFFF',
  inversePrimary: '#D5F478',

  // Scrim modal (hitam 32%)
  scrim: 'rgba(20, 38, 30, 0.48)',

  // Legacy pillar labels remain readable on light containers.
  pillars: {
    career: '#125B50',
    finance: '#7B4B22',
    health: '#A83030',
    growth: '#574582',
    personal: '#315F85',
  },
} as const;

export type ColorToken = keyof typeof colors;
