/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/design/DESIGN_V3.md (MyLife).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Paper canvas (MyLife).
  background: '#F1F4F8',
  surface: '#F1F4F8',
  surfaceContainerLowest: '#FAFBFD',
  surfaceContainerLow: '#E6EBF3',
  surfaceContainer: '#DEE5EF',
  surfaceContainerHigh: '#D0D9E6',
  surfaceContainerHighest: '#C1CCDE',

  // Indigo focus surface and controls.
  primary: '#283E73',
  primaryHover: '#1E2E55',
  primaryContainer: '#DDE6F5',
  onPrimary: '#FAFBFD',
  onPrimaryContainer: '#22345A',
  hero: '#283E73',
  onHero: '#FAFBFD',
  onHeroMuted: '#DDE6F5',
  heroDecoration: '#3F5688',
  heroTrack: '#8096C0',

  // Apricot accent (CTA & FAB).
  secondary: '#764819',
  secondaryContainer: '#FFC28A',
  onSecondary: '#FAFBFD',
  onSecondaryContainer: '#472807',

  // Leaf green
  tertiary: '#275C53',
  tertiaryContainer: '#DDE6F5',
  onTertiary: '#FAFBFD',
  onTertiaryContainer: '#214B42',

  // Highlight (sunshine)
  highlight: '#FFC28A',
  highlightContainer: '#FBE7D8',
  onHighlight: '#472807',
  onHighlightContainer: '#472807',

  // Text hierarchy (deep green ink).
  onSurface: '#172A45',
  onSurfaceVariant: '#475A70',
  onSurfaceSubtle: '#526279',

  // Border & divider: soft warm lines
  outline: '#68778A',
  outlineVariant: '#CBD5E2',
  border: '#CBD5E2',

  // Status
  success: '#246050',
  successContainer: '#E0F1E6',
  onSuccess: '#FAFBFD',
  onSuccessContainer: '#194B31',

  error: '#9E3341',
  errorContainer: '#FFE4E0',
  onError: '#FAFBFD',
  onErrorContainer: '#7B2424',

  warning: '#795018',
  warningContainer: '#FFF0CE',
  onWarning: '#FAFBFD',
  onWarningContainer: '#62400D',

  // Inverse (snackbar)
  inverseSurface: '#1D3051',
  inverseOnSurface: '#FAFBFD',
  inversePrimary: '#FFC28A',

  // Scrim modal (hitam 32%)
  scrim: 'rgba(23, 42, 69, 0.48)',

  // Shared visual roles for existing screens
  sprout: {
    cream: '#F1F4F8',
    creamDeep: '#E6EBF3',
    card: '#FAFBFD',
    cardShade: '#E6EBF3',
    forest: '#283E73',
    forestDeep: '#1E2E55',
    forestSoft: '#3F5688',
    leaf: '#43669B',
    leafSoft: '#DDE6F5',
    leafMist: '#E7EEF7',
    sun: '#FFC28A',
    sunDeep: '#E9A768',
    sunSoft: '#FBE7D8',
    ink: '#172A45',
    inkMuted: '#475A70',
    inkSubtle: '#475A70',
    inkFaint: '#526279',
    rose: '#AD4B40',
    roseSoft: '#FBE3E1',
    teal: '#21665C',
    tealSoft: '#DDEFEA',
    grape: '#66528C',
    grapeSoft: '#EEE8F5',
  },

  // Neo-Bento Pop Palette (High-Contrast, Playful & Vibrant)
  bento: {
    canvas: '#F8F7FC',
    surface: '#FFFFFF',
    obsidian: '#161722',
    obsidianCard: '#1E202B',
    obsidianMuted: '#2B2D3C',
    lilac: '#9E86FF',
    lilacSoft: '#ECE8FF',
    tangerine: '#FFA834',
    tangerineSoft: '#FFF3E0',
    coral: '#FF4582',
    coralSoft: '#FFE8EF',
    mint: '#2DD4BF',
    mintSoft: '#E6FAF7',
    sky: '#82B1FF',
    skySoft: '#E8F1FF',
    lemon: '#FFE066',
    pillBorder: '#E6E4F0',
    textDark: '#161722',
    textMuted: '#64748B',
    textLight: '#FFFFFF',
    textLightMuted: '#C2C0D4',

    // Exact Google Stitch Tokens
    stitchCanvas: '#F6F4EE',
    stitchLavender: '#A5A6F6',
    stitchLavenderDark: '#7577EC',
    stitchLavenderLight: '#ECEBFE',
    stitchTangerine: '#FF9E44',
    stitchTangerineLight: '#FFF1E5',
    stitchForest: '#13352C',
    stitchCitron: '#DCF763',
    stitchObsidian: '#151718',
    stitchSoftGray: '#F0EFEA',
  },

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
