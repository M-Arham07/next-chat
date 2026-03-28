import { useColorScheme } from "react-native";
import { LightColors, DarkColors, ThemeColors } from "@/constants/colors";

export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? DarkColors : LightColors;
}

export function useIsDarkMode(): boolean {
  const colorScheme = useColorScheme();
  return colorScheme === "dark";
}
