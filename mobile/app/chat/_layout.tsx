import { Stack } from "expo-router";
import { ChatAppProvider } from "@/features/chat/hooks/use-chat-app";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatLayout() {
  // In a real app the session would be retrieved properly
  const mockSession = { user: { username: "m_arham07" } };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <ChatAppProvider session={mockSession}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1a1a1a' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="[threadId]" />
          <Stack.Screen name="new" />
        </Stack>
      </ChatAppProvider>
    </SafeAreaView>
  );
}
