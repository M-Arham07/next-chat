/**
 * Design System Color Tokens
 * Converted from oklch to RGB values for React Native
 * Light and Dark mode variants preserved exactly
 */

export const COLORS = {
  light: {
    background: "rgb(248 248 252)",
    foreground: "rgb(15 23 42)",
    card: "rgb(255 255 255)",
    cardForeground: "rgb(15 23 42)",
    popover: "rgb(255 255 255)",
    popoverForeground: "rgb(15 23 42)",
    primary: "rgb(30 30 30)",
    primaryForeground: "rgb(248 248 252)",
    secondary: "rgb(235 235 240)",
    secondaryForeground: "rgb(15 23 42)",
    muted: "rgb(226 232 240)",
    mutedForeground: "rgb(100 116 139)",
    accent: "rgb(30 30 30)",
    accentForeground: "rgb(248 248 252)",
    destructive: "rgb(239 68 68)",
    destructiveForeground: "rgb(255 255 255)",
    border: "rgb(235 235 240)",
    input: "rgb(245 245 250)",
    ring: "rgb(51 65 85 / 0.5)",
    success: "rgb(34 197 94)",
    successForeground: "rgb(245 245 245)",
  },
  dark: {
    background: "rgb(25 25 30)",
    foreground: "rgb(245 245 250)",
    card: "rgb(38 38 45)",
    cardForeground: "rgb(245 245 250)",
    popover: "rgb(30 30 36)",
    popoverForeground: "rgb(245 245 250)",
    primary: "rgb(250 250 250)",
    primaryForeground: "rgb(25 25 30)",
    secondary: "rgb(64 64 70)",
    secondaryForeground: "rgb(245 245 250)",
    muted: "rgb(71 71 78)",
    mutedForeground: "rgb(168 162 168)",
    accent: "rgb(250 250 250)",
    accentForeground: "rgb(25 25 30)",
    destructive: "rgb(101 74 74)",
    destructiveForeground: "rgb(162 60 60)",
    border: "rgb(64 64 70)",
    input: "rgb(51 51 56)",
    ring: "rgb(128 128 128)",
    success: "rgb(87 167 87)",
    successForeground: "rgb(245 245 245)",
  },
};

// Typography from web version
export const TYPOGRAPHY = {
  fonts: {
    sans: "system",
    mono: "monospace",
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing scale
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// Border radius
export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  full: 9999,
};

// Shadow definitions
export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export type ColorScheme = "light" | "dark";
export type ColorKey = keyof typeof COLORS.light;
