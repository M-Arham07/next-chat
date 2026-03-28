import { Pressable } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { useThemeColors, useIsDarkMode } from "@/hooks/useThemeColors";

export function ThemeToggle() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // Note: In React Native, system theme is used automatically
  // This toggle is decorative - actual theme switching requires additional setup
  return (
    <Pressable
      className="p-2 rounded-full"
      style={{ backgroundColor: colors.secondary }}
    >
      {isDark ? (
        <Sun size={20} color={colors.foreground} />
      ) : (
        <Moon size={20} color={colors.foreground} />
      )}
    </Pressable>
  );
}
