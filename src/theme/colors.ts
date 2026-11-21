/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/design/DESIGN_V3.md (MyLife Fieldnotes).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Paper canvas (MyLife Fieldnotes).
  background: '#F7F8F2',
  surface: '#F7F8F2',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#EEF0E8',
  surfaceContainer: '#E5E9DF',
  surfaceContainerHigh: '#DAE0D3',
  surfaceContainerHighest: '#CAD3C3',

  // Deep forest green actions & hero blobs.
  primary: '#203E35',
  primaryHover: '#172E27',
  primaryContainer: '#E7EDDC',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1B4A3F',
  hero: '#203E35',
  onHero: '#FFFFFF',
  onHeroMuted: '#E7EDDC',
  heroDecoration: '#36594C',
  heroTrack: '#5E8F80',

  // Citron accent (CTA & FAB).
  secondary: '#8A5A00',
  secondaryContainer: '#D7EF78',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#3D2A00',

  // Leaf green
  tertiary: '#3F7A2E',
  tertiaryContainer: '#E7EDDC',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#244A1A',

  // Highlight (sunshine)
  highlight: '#D7EF78',
  highlightContainer: '#EFF6D4',
  onHighlight: '#3D2A00',
  onHighlightContainer: '#3D2A00',

  // Text hierarchy (deep green ink).
  onSurface: '#202E29',
  onSurfaceVariant: '#5E6B64',
  onSurfaceSubtle: '#646F68',

  // Border & divider: soft warm lines
  outline: '#8A9389',
  outlineVariant: '#DDE3D8',
  border: '#DDE3D8',

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

  // Fieldnotes palette; legacy sprout keys keep existing consumers compatible
  sprout: {
    cream: '#F7F8F2',
    creamDeep: '#EEF0E8',
    card: '#FFFFFF',
    cardShade: '#E9EDE3',
    forest: '#203E35',
    forestDeep: '#172E27',
    forestSoft: '#36594C',
    leaf: '#8CC152',
    leafSoft: '#E7EDDC',
    leafMist: '#EEF4E2',
    sun: '#D7EF78',
    sunDeep: '#C3DC60',
    sunSoft: '#EFF6D4',
    ink: '#202E29',
    inkMuted: '#5E6B64',
    inkSubtle: '#5E6B64',
    inkFaint: '#646F68',
    rose: '#AD4B40',
    roseSoft: '#FBE3E1',
    teal: '#2F8F83',
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
