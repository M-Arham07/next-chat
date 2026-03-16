/**
 * Convert oklch color values to RGB hex format
 * Based on the exact colors from web/app/globals.css
 */

export const oklchToRgb = (l: number, c: number, h: number): string => {
  // Oklch to LMS
  const hRad = (h * Math.PI) / 180;
  const L = l + 0.3963377774 * Math.cos(hRad) * c + 0.2158037573 * Math.sin(hRad) * c;
  const M = l - 0.1055613458 * Math.cos(hRad) * c - 0.0638541728 * Math.sin(hRad) * c;
  const S = l - 0.0894841775 * Math.cos(hRad) * c - 1.291486575 * Math.sin(hRad) * c;

  // LMS to linear RGB
  const l_ = L * L * L;
  const m_ = M * M * M;
  const s_ = S * S * S;

  const r = 4.0767416621 * l_ - 3.3077363322 * m_ + 0.2309101289 * s_;
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193761 * s_;
  const b = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

  // Linear RGB to sRGB
  const toSrgb = (v: number) => {
    if (v <= 0.0031308) return 12.92 * v;
    return 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  };

  const rSrgb = Math.round(toSrgb(r) * 255);
  const gSrgb = Math.round(toSrgb(g) * 255);
  const bSrgb = Math.round(toSrgb(b) * 255);

  return `rgb(${rSrgb} ${gSrgb} ${bSrgb})`;
};

/**
 * Web design colors in oklch
 * Converted from web/app/globals.css
 */
export const WEB_COLORS_LIGHT = {
  background: oklchToRgb(0.98, 0, 0),      // oklch(0.98 0 0)
  foreground: oklchToRgb(0.15, 0, 0),      // oklch(0.15 0 0)
  card: oklchToRgb(1, 0, 0),               // oklch(1 0 0)
  cardForeground: oklchToRgb(0.15, 0, 0),  // oklch(0.15 0 0)
  popover: oklchToRgb(1, 0, 0),            // oklch(1 0 0)
  popoverForeground: oklchToRgb(0.15, 0, 0), // oklch(0.15 0 0)
  primary: oklchToRgb(0.12, 0, 0),         // oklch(0.12 0 0)
  primaryForeground: oklchToRgb(0.98, 0, 0), // oklch(0.98 0 0)
  secondary: oklchToRgb(0.92, 0, 0),       // oklch(0.92 0 0)
  secondaryForeground: oklchToRgb(0.15, 0, 0), // oklch(0.15 0 0)
  muted: oklchToRgb(0.88, 0, 0),           // oklch(0.88 0 0)
  mutedForeground: oklchToRgb(0.45, 0, 0), // oklch(0.45 0 0)
  accent: oklchToRgb(0.12, 0, 0),          // oklch(0.12 0 0)
  accentForeground: oklchToRgb(0.98, 0, 0), // oklch(0.98 0 0)
  destructive: oklchToRgb(0.577, 0.245, 27.325), // oklch(0.577 0.245 27.325)
  destructiveForeground: oklchToRgb(0.577, 0.245, 27.325), // oklch(0.577 0.245 27.325)
  border: oklchToRgb(0.92, 0, 0),          // oklch(0.92 0 0)
  input: oklchToRgb(0.96, 0, 0),           // oklch(0.96 0 0)
  ring: oklchToRgb(0.5, 0, 0),             // oklch(0.5 0 0)
} as const;

export const WEB_COLORS_DARK = {
  background: oklchToRgb(0.1, 0, 0),       // oklch(0.1 0 0)
  foreground: oklchToRgb(0.96, 0, 0),      // oklch(0.96 0 0)
  card: oklchToRgb(0.15, 0, 0),            // oklch(0.15 0 0)
  cardForeground: oklchToRgb(0.96, 0, 0),  // oklch(0.96 0 0)
  popover: oklchToRgb(0.12, 0, 0),         // oklch(0.12 0 0)
  popoverForeground: oklchToRgb(0.96, 0, 0), // oklch(0.96 0 0)
  primary: oklchToRgb(0.98, 0, 0),         // oklch(0.98 0 0)
  primaryForeground: oklchToRgb(0.1, 0, 0), // oklch(0.1 0 0)
  secondary: oklchToRgb(0.25, 0, 0),       // oklch(0.25 0 0)
  secondaryForeground: oklchToRgb(0.96, 0, 0), // oklch(0.96 0 0)
  muted: oklchToRgb(0.28, 0, 0),           // oklch(0.28 0 0)
  mutedForeground: oklchToRgb(0.65, 0, 0), // oklch(0.65 0 0)
  accent: oklchToRgb(0.98, 0, 0),          // oklch(0.98 0 0)
  accentForeground: oklchToRgb(0.1, 0, 0), // oklch(0.1 0 0)
  destructive: oklchToRgb(0.396, 0.141, 25.723), // oklch(0.396 0.141 25.723)
  destructiveForeground: oklchToRgb(0.637, 0.237, 25.331), // oklch(0.637 0.237 25.331)
  border: oklchToRgb(0.25, 0, 0),          // oklch(0.25 0 0)
  input: oklchToRgb(0.2, 0, 0),            // oklch(0.2 0 0)
  ring: oklchToRgb(0.5, 0, 0),             // oklch(0.5 0 0)
} as const;
