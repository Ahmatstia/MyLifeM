/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/DESIGN_V2.md (Botanical Pop).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Warm cream "storybook" canvas (MyLife Sprout theme).
  background: '#FAF6EC',
  surface: '#FAF6EC',
  surfaceContainerLowest: '#FFFDF8',
  surfaceContainerLow: '#F3EEE2',
  surfaceContainer: '#EDE7D8',
  surfaceContainerHigh: '#E5DFCD',
  surfaceContainerHighest: '#D9D2BE',

  // Deep forest green actions & hero blobs.
  primary: '#1E5A4C',
  primaryHover: '#174A3E',
  primaryContainer: '#E3EED3',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1B4A3F',
  hero: '#1E5A4C',
  onHero: '#FFFFFF',
  onHeroMuted: '#E3EED3',
  heroDecoration: '#2D6E5E',
  heroTrack: '#5E8F80',

  // Warm sunshine yellow accent (CTA & FAB).
  secondary: '#8A5A00',
  secondaryContainer: '#F7C948',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#3D2A00',

  // Leaf green
  tertiary: '#3F7A2E',
  tertiaryContainer: '#E3EED3',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#244A1A',

  // Highlight (sunshine)
  highlight: '#F7C948',
  highlightContainer: '#FCEFC4',
  onHighlight: '#3D2A00',
  onHighlightContainer: '#3D2A00',

  // Text hierarchy (deep green ink).
  onSurface: '#1F3B34',
  onSurfaceVariant: '#5E6B64',
  onSurfaceSubtle: '#646F68',

  // Border & divider: soft warm lines
  outline: '#8A9389',
  outlineVariant: '#E8E1D0',
  border: '#E8E1D0',

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

  // MyLife Sprout palette (reference storybook UI)
  sprout: {
    cream: '#FAF6EC',
    creamDeep: '#F3EEE2',
    card: '#FFFDF8',
    cardShade: '#EFE8D8',
    forest: '#1E5A4C',
    forestDeep: '#174A3E',
    forestSoft: '#2D6E5E',
    leaf: '#8CC152',
    leafSoft: '#E3EED3',
    leafMist: '#EEF4E2',
    sun: '#F7C948',
    sunDeep: '#EDB82E',
    sunSoft: '#FCEFC4',
    ink: '#1F3B34',
    inkMuted: '#5E6B64',
    inkSubtle: '#7A867F',
    inkFaint: '#9AA39C',
    rose: '#E8636B',
    roseSoft: '#FBE3E1',
    teal: '#2F8F83',
    tealSoft: '#DDEFEA',
    grape: '#7B6CD9',
    grapeSoft: '#E9E5FA',
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
