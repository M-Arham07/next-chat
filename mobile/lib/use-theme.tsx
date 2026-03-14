import { useColorScheme } from "react-native";
import { COLORS, ColorScheme } from "./theme";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scheme = (isDark ? "dark" : "light") as ColorScheme;

  return {
    isDark,
    scheme,
    colors: COLORS[scheme],
  };
}

/**
 * Get a color value from the current theme
 * Usage: getColor('primary', isDark)
 */
export function getColor(
  colorKey: keyof typeof COLORS.light,
  isDark: boolean
): string {
  return COLORS[isDark ? "dark" : "light"][colorKey];
}
