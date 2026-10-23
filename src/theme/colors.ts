/**
 * MyLife Mobile Design System - Color Tokens
 * Palette: "Deep Obsidian Teal" (#081013 with Teal #14b8a6 and Warm Amber accents)
 * Offline-First Personal Life OS
 */

export const colors = {
  // Base Obsidian Surfaces
  background: '#081013',
  surface: '#081013',
  surfaceContainerLow: '#0f1b20',
  surfaceContainer: '#15242b',
  surfaceContainerHigh: '#1c3039',
  surfaceContainerHighest: '#243c44',
  surfaceContainerLowest: '#050a0c',

  // Brand / Teal Accents
  primary: '#14b8a6',
  primaryHover: '#0d9488',
  primaryContainer: '#134e4a',
  onPrimary: '#042f2e',
  onPrimaryContainer: '#ccfbf1',

  // Secondary Accents
  secondary: '#2dd4bf',
  secondaryContainer: '#0f766e',
  onSecondary: '#081013',
  onSecondaryContainer: '#f0fdfa',

  // Warm Canvas / Streak Highlight
  highlight: '#f59e0b',
  highlightContainer: '#78350f',
  onHighlight: '#1f1300',
  onHighlightContainer: '#fef3c7',

  // Typography & Text
  onSurface: '#f1f5f9',
  onSurfaceVariant: '#94a3b8',
  onSurfaceSubtle: '#64748b',

  // Borders & Dividers
  outline: '#243c44',
  outlineVariant: '#16282e',
  border: '#243c44',

  // Status & Feedback
  success: '#10b981',
  successContainer: '#064e3b',
  onSuccess: '#ffffff',
  onSuccessContainer: '#a7f3d0',

  error: '#ef4444',
  errorContainer: '#7f1d1d',
  onError: '#ffffff',
  onErrorContainer: '#fecaca',

  warning: '#f59e0b',
  warningContainer: '#78350f',
  onWarning: '#ffffff',
  onWarningContainer: '#fef3c7',

  // 5 Life Pillars Colors
  pillars: {
    career: '#14b8a6',
    finance: '#f59e0b',
    health: '#ef4444',
    growth: '#8b5cf6',
    personal: '#3b82f6',
  },
} as const;

export type ColorToken = keyof typeof colors;
