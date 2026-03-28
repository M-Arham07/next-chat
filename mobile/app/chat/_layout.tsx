import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ChatAppProvider } from "@/features/chat/providers/ChatAppProvider";

export default function ChatLayout() {
  const colors = useThemeColors();

  return (
    <ChatAppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(threads)" />
        <Stack.Screen name="new/index" />
      </Stack>
    </ChatAppProvider>
  );
}
