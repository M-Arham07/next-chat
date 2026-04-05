import { ChatAppProvider } from "@/features/chat/hooks/use-chat-app";
import { Stack } from "expo-router";

export default function ChatAppMainLayout() {
    return (
        <ChatAppProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ChatAppProvider>
    )
}
