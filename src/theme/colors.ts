/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/DESIGN.md Bagian 3.2 (tema light, primary indigo #4C4DCC).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Surfaces: Warm porcelain & marshmallow whites
  background: '#FAF8FE',
  surface: '#FAF8FE',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F4F1FA',
  surfaceContainer: '#EEEBF6',
  surfaceContainerHigh: '#E7E3F0',
  surfaceContainerHighest: '#E0DCEB',

  // Brand: Soft Sweet Periwinkle Indigo
  primary: '#5C54E5',
  primaryHover: '#4E46D8',
  primaryContainer: '#ECEAFE',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#28208C',

  // Secondary: Warm Soft Coral Peach (Cute accent)
  secondary: '#FF8A65',
  secondaryContainer: '#FFF0EB',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#8C2B0D',

  // Tertiary (aksen hangat untuk teks/ikon)
  tertiary: '#38A169',
  tertiaryContainer: '#E6F9EE',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#144F2E',

  // Highlight (hanya sebagai isi untuk momen spesial, mis. streak)
  highlight: '#FF9F43',
  highlightContainer: '#FFF3E6',
  onHighlight: '#6B3800',
  onHighlightContainer: '#6B3800',

  // Teks: Soft Deep Slate (not harsh pure black)
  onSurface: '#242132',
  onSurfaceVariant: '#68637B',
  onSurfaceSubtle: '#736E85',

  // Border & divider: Whisper-soft borders (no harsh wireframe outlines)
  outline: '#E8E3F2',
  outlineVariant: '#EFEBF7',
  border: '#EFEBF7',

  // Status
  success: '#38A169',
  successContainer: '#E6F9EE',
  onSuccess: '#FFFFFF',
  onSuccessContainer: '#144F2E',

  error: '#E53E3E',
  errorContainer: '#FFEBEB',
  onError: '#FFFFFF',
  onErrorContainer: '#741515',

  warning: '#D69E2E',
  warningContainer: '#FEFCBF',
  onWarning: '#FFFFFF',
  onWarningContainer: '#744210',

  // Inverse (snackbar)
  inverseSurface: '#313034',
  inverseOnSurface: '#F3EFF4',
  inversePrimary: '#C1C1FF',

  // Scrim modal (hitam 32%)
  scrim: 'rgba(36, 33, 50, 0.40)',

  // Warna kategori untuk 5 Pilar Kehidupan (Cute Pastel Tinted)
  pillars: {
    career: '#2EA39B', // soft teal
    finance: '#E28743', // warm honey apricot
    health: '#E25252', // soft coral red
    growth: '#8A5BE0', // soft purple lavender
    personal: '#3A7BD5', // soft sky blue
  },
} as const;

export type ColorToken = keyof typeof colors;
