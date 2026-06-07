export const colors = {
  // === BASE ===
  bg: '#EDEAE4',            // warm light grey (page background)
  card: '#FFFFFF',           // white cards
  cardDark: '#1A1F2E',      // dark navy (hero headers) — padrão "dark hero"
  cardActive: '#F5F2EE',    // slightly darker bg for hover/active
  cardHighlight: '#F0EDE8', // highlight variant

  // === BORDERS ===
  border: '#E2DDD8',         // subtle warm border

  // === TEXT ===
  text: '#1F2430',           // dark graphite (main)
  textLight: '#FFFFFF',      // white (for use on dark cards)
  textSecondary: '#6B7280',  // medium grey
  textMuted: '#9CA3AF',      // light grey
  textDimmed: '#C4BDB6',     // very light (dimmed hints)

  // === PRIMARY — VIOLET ===
  primary: '#7C5CBF',
  primaryFaded: '#7C5CBF33',
  primarySubtle: '#7C5CBF15',

  // === ACCENTS ===
  secondary: '#00B4CC',      // cyan
  gold: '#B8952A',           // gold (XP, achievements, selos)

  // === DIMENSION COLORS (IVI 4D — V2.0604) ===
  fisico: '#22D3EE',         // cyan   — Físico
  mental: '#8B5CF6',         // violet — Mental
  social: '#F59E0B',         // amber  — Social
  espiritual: '#22C55E',     // green  — Espiritual

  // === STATUS ===
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#22C55E',
  warning: '#F59E0B',

  // === SURFACES ===
  surface: '#F5F2ED',

  // === UI SPECIFIC ===
  like: '#EF4444',
  userBubble: '#1A1F2E',     // dark navy for user chat bubbles

  // === MACRO NUTRIENTS ===
  macro: {
    protein: '#FF6B6B',
    carbs: '#4ECDC4',
    fat: '#FFD93D',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  body: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  title: 22,
  hero: 24,
  display: 32,
  splash: 36,
  caption: 11,
  bodyLarge: 16,
  heading: 20,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 20,
  round: 28,
} as const;
