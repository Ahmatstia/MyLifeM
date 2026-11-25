/**
 * MyLife Mobile Design System - Color Tokens
 * Sumber kebenaran: docs/design/DESIGN_V4.md (MyLife).
 * Nama key lama dipertahankan agar seluruh layar otomatis mengikuti tema baru.
 */

export const colors = {
  // Enamel surfaces and hands on the focus clock.
  clockCase: '#CAE5D9',
  clockEdge: '#A5C7B8',
  clockFace: '#FFD1B7',
  clockSector: '#F39A78',
  clockInk: '#48283F',
  clockTick: '#834B54',
  folderLilac: '#E9DFF1',
  folderMint: '#DDECE3',
  folderPeach: '#F9E1D6',

  // General surfaces.
  background: '#F6F3F6',
  surface: '#F6F3F6',
  surfaceContainerLowest: '#FFFCFD',
  surfaceContainerLow: '#F0EAF0',
  surfaceContainer: '#E9DFE7',
  surfaceContainerHigh: '#DCCDD9',
  surfaceContainerHighest: '#CCB9C9',

  // Mulberry controls.
  primary: '#572C50',
  primaryHover: '#41233F',
  primaryContainer: '#EADCF0',
  onPrimary: '#FFFCFD',
  onPrimaryContainer: '#462748',
  hero: '#572C50',
  onHero: '#FFFCFD',
  onHeroMuted: '#EADCF0',
  heroDecoration: '#75486A',
  heroTrack: '#AE8FA6',

  // Coral actions.
  secondary: '#774234',
  secondaryContainer: '#FFB298',
  onSecondary: '#FFFCFD',
  onSecondaryContainer: '#50271E',

  // Leaf green
  tertiary: '#275C53',
  tertiaryContainer: '#EADCF0',
  onTertiary: '#FFFCFD',
  onTertiaryContainer: '#214B42',

  // Highlight (sunshine)
  highlight: '#FFB298',
  highlightContainer: '#FFE2D6',
  onHighlight: '#50271E',
  onHighlightContainer: '#50271E',

  // Plum-tinted text.
  onSurface: '#332538',
  onSurfaceVariant: '#635568',
  onSurfaceSubtle: '#6A5B70',

  // Border & divider: soft warm lines
  outline: '#847184',
  outlineVariant: '#DCCFDA',
  border: '#DCCFDA',

  // Status
  success: '#246050',
  successContainer: '#E0F1E6',
  onSuccess: '#FFFCFD',
  onSuccessContainer: '#194B31',

  error: '#9E3341',
  errorContainer: '#FFE4E0',
  onError: '#FFFCFD',
  onErrorContainer: '#7B2424',

  warning: '#795018',
  warningContainer: '#FFF0CE',
  onWarning: '#FFFCFD',
  onWarningContainer: '#62400D',

  // Inverse (snackbar)
  inverseSurface: '#362538',
  inverseOnSurface: '#FFFCFD',
  inversePrimary: '#FFB298',

  // Scrim modal (hitam 32%)
  scrim: 'rgba(51, 37, 56, 0.48)',

  // Shared visual roles for existing screens
  sprout: {
    cream: '#F6F3F6',
    creamDeep: '#F0EAF0',
    card: '#FFFCFD',
    cardShade: '#F0EAF0',
    forest: '#572C50',
    forestDeep: '#41233F',
    forestSoft: '#75486A',
    leaf: '#785578',
    leafSoft: '#EADCF0',
    leafMist: '#F0E8F4',
    sun: '#FFB298',
    sunDeep: '#F2987B',
    sunSoft: '#FFE2D6',
    ink: '#332538',
    inkMuted: '#635568',
    inkSubtle: '#635568',
    inkFaint: '#6A5B70',
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
