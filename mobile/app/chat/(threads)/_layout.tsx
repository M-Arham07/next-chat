import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function ThreadsLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[threadId]/index" />
    </Stack>
  );
}
