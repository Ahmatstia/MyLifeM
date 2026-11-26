import { todayColors as c } from './today';

/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/design/DESIGN_V4.md (MyLife).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Enamel surfaces and hands on the focus clock.
  clockCase: c.sky,
  clockEdge: '#B3D6E0',
  clockFace: c.peach,
  clockSector: '#E7AF8A',
  clockInk: c.ink,
  clockTick: c.peachInk,
  folderLilac: c.lilac,
  folderMint: c.mint,
  folderPeach: c.peach,

  // General surfaces.
  background: c.paper,
  surface: c.paper,
  surfaceContainerLowest: c.card,
  surfaceContainerLow: c.completed,
  surfaceContainer: c.line,
  surfaceContainerHigh: '#D8C9B0',
  surfaceContainerHighest: '#C8B79B',

  // Ink controls on warm paper.
  primary: c.ink,
  primaryHover: '#29231D',
  primaryContainer: c.goldSoft,
  onPrimary: c.card,
  onPrimaryContainer: c.ink,
  hero: c.ink,
  onHero: c.card,
  onHeroMuted: c.goldSoft,
  heroDecoration: '#544736',
  heroTrack: '#B7A68C',

  // Peach supporting actions.
  secondary: c.peachInk,
  secondaryContainer: c.peach,
  onSecondary: c.card,
  onSecondaryContainer: c.peachInk,

  // Leaf green
  tertiary: c.skyInk,
  tertiaryContainer: c.sky,
  onTertiary: c.card,
  onTertiaryContainer: c.skyInk,

  // Highlight (sunshine)
  highlight: c.gold,
  highlightContainer: c.goldSoft,
  onHighlight: c.ink,
  onHighlightContainer: c.goldInk,

  // Warm ink text.
  onSurface: c.ink,
  onSurfaceVariant: c.muted,
  onSurfaceSubtle: c.muted,

  // Border & divider: soft warm lines
  outline: c.muted,
  outlineVariant: c.line,
  border: c.line,

  // Status
  success: c.mintInk,
  successContainer: c.mint,
  onSuccess: c.card,
  onSuccessContainer: c.mintInk,

  error: '#9E3341',
  errorContainer: '#FFE4E0',
  onError: c.card,
  onErrorContainer: '#7B2424',

  warning: c.goldInk,
  warningContainer: c.goldSoft,
  onWarning: c.card,
  onWarningContainer: c.goldInk,

  // Inverse (snackbar)
  inverseSurface: c.ink,
  inverseOnSurface: c.card,
  inversePrimary: c.gold,

  // Scrim modal (hitam 32%)
  scrim: 'rgba(53, 46, 38, 0.38)',

  // Shared visual roles for existing screens
  sprout: {
    cream: c.paper,
    creamDeep: c.completed,
    card: c.card,
    cardShade: c.completed,
    forest: c.ink,
    forestDeep: '#29231D',
    forestSoft: '#544736',
    leaf: c.mintInk,
    leafSoft: c.mint,
    leafMist: '#EDF4E5',
    sun: c.gold,
    sunDeep: '#EAC272',
    sunSoft: c.goldSoft,
    ink: c.ink,
    inkMuted: c.muted,
    inkSubtle: c.muted,
    inkFaint: c.muted,
    rose: c.peachInk,
    roseSoft: c.peach,
    teal: c.skyInk,
    tealSoft: c.sky,
    grape: c.lilacInk,
    grapeSoft: c.lilac,
  },

  // Neo-Bento Pop Palette (High-Contrast, Playful & Vibrant)
  bento: {
    canvas: '#F8F7FC',
    surface: c.paper,
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
