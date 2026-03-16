/**
 * Design System Color Tokens
 * Converted from oklch to RGB values for React Native
 * Light and Dark mode variants preserved exactly from web/app/globals.css
 */

import { WEB_COLORS_LIGHT, WEB_COLORS_DARK } from "./color-converter";

export const COLORS = {
  light: {
    background: WEB_COLORS_LIGHT.background,
    foreground: WEB_COLORS_LIGHT.foreground,
    card: WEB_COLORS_LIGHT.card,
    cardForeground: WEB_COLORS_LIGHT.cardForeground,
    popover: WEB_COLORS_LIGHT.popover,
    popoverForeground: WEB_COLORS_LIGHT.popoverForeground,
    primary: WEB_COLORS_LIGHT.primary,
    primaryForeground: WEB_COLORS_LIGHT.primaryForeground,
    secondary: WEB_COLORS_LIGHT.secondary,
    secondaryForeground: WEB_COLORS_LIGHT.secondaryForeground,
    muted: WEB_COLORS_LIGHT.muted,
    mutedForeground: WEB_COLORS_LIGHT.mutedForeground,
    accent: WEB_COLORS_LIGHT.accent,
    accentForeground: WEB_COLORS_LIGHT.accentForeground,
    destructive: WEB_COLORS_LIGHT.destructive,
    destructiveForeground: WEB_COLORS_LIGHT.destructiveForeground,
    border: WEB_COLORS_LIGHT.border,
    input: WEB_COLORS_LIGHT.input,
    ring: WEB_COLORS_LIGHT.ring,
    success: "rgb(34 197 94)",
    successForeground: "rgb(245 245 245)",
  },
  dark: {
    background: WEB_COLORS_DARK.background,
    foreground: WEB_COLORS_DARK.foreground,
    card: WEB_COLORS_DARK.card,
    cardForeground: WEB_COLORS_DARK.cardForeground,
    popover: WEB_COLORS_DARK.popover,
    popoverForeground: WEB_COLORS_DARK.popoverForeground,
    primary: WEB_COLORS_DARK.primary,
    primaryForeground: WEB_COLORS_DARK.primaryForeground,
    secondary: WEB_COLORS_DARK.secondary,
    secondaryForeground: WEB_COLORS_DARK.secondaryForeground,
    muted: WEB_COLORS_DARK.muted,
    mutedForeground: WEB_COLORS_DARK.mutedForeground,
    accent: WEB_COLORS_DARK.accent,
    accentForeground: WEB_COLORS_DARK.accentForeground,
    destructive: WEB_COLORS_DARK.destructive,
    destructiveForeground: WEB_COLORS_DARK.destructiveForeground,
    border: WEB_COLORS_DARK.border,
    input: WEB_COLORS_DARK.input,
    ring: WEB_COLORS_DARK.ring,
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
