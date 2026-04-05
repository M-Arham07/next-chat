import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/lib/useThemeColors";
import { Moon, Sun } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const colors = useThemeColors();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full border border-border"
      onPress={toggleColorScheme}
    >
      {colorScheme === "dark" ? (
        <Moon size={16} color={colors.foreground} />
      ) : (
        <Sun size={16} color={colors.foreground} />
      )}
      <Text className="hidden">Toggle theme</Text>
    </Button>
  );
}
