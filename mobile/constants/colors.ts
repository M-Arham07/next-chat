// Design tokens matching web globals.css (converted from oklch to hex)

export const LightColors = {
  background: "#F9F9F9",
  foreground: "#262626",
  card: "#FFFFFF",
  cardForeground: "#262626",
  popover: "#FFFFFF",
  popoverForeground: "#262626",
  primary: "#1F1F1F",
  primaryForeground: "#F9F9F9",
  secondary: "#EBEBEB",
  secondaryForeground: "#262626",
  muted: "#E0E0E0",
  mutedForeground: "#737373",
  accent: "#1F1F1F",
  accentForeground: "#F9F9F9",
  destructive: "#E53E3E",
  destructiveForeground: "#E53E3E",
  border: "#EBEBEB",
  input: "#F5F5F5",
  ring: "#808080",
  // Message colors
  messageSent: "#1F1F1F",
  messageReceived: "#FFFFFF",
  // Glass effect
  glassBorder: "rgba(255, 255, 255, 0.2)",
};

export const DarkColors = {
  background: "#1A1A1A",
  foreground: "#F5F5F5",
  card: "#262626",
  cardForeground: "#F5F5F5",
  popover: "#1F1F1F",
  popoverForeground: "#F5F5F5",
  primary: "#F9F9F9",
  primaryForeground: "#1A1A1A",
  secondary: "#404040",
  secondaryForeground: "#F5F5F5",
  muted: "#474747",
  mutedForeground: "#A6A6A6",
  accent: "#F9F9F9",
  accentForeground: "#1A1A1A",
  destructive: "#7F1D1D",
  destructiveForeground: "#FCA5A5",
  border: "#404040",
  input: "#333333",
  ring: "#808080",
  // Message colors
  messageSent: "#F9F9F9",
  messageReceived: "#262626",
  // Glass effect
  glassBorder: "rgba(255, 255, 255, 0.1)",
};

export type ThemeColors = typeof LightColors;

// Border radius
export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  full: 9999,
};

// Spacing scale
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};
