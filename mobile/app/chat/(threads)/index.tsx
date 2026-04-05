import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { useRouter } from "expo-router";
import { View, ScrollView, Pressable } from "react-native";

export default function MobileThreadPage() {
  const router = useRouter();
  const chatApp = useChatApp();
  const threads = chatApp?.filteredThreads ?? [];

  return (
    <View className="flex-1 bg-background px-4 pt-16">
      <Text className="text-3xl font-bold tracking-tight">Threads</Text>
      <Text className="mt-2 text-sm text-muted-foreground">Your recent conversations</Text>

      <ScrollView className="mt-6 flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-3">
          {threads.length ? threads.map((thread) => (
            <Pressable
              key={thread.threadId}
              className="rounded-xl border border-border bg-card p-4"
              onPress={() => (router.push as (href: string) => void)(`/chat/(threads)/${thread.threadId}`)}
            >
              <Text className="text-base font-semibold">{thread.groupName || thread.participants?.[0]?.username || "Conversation"}</Text>
              <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={1}>
                {"Open thread"}
              </Text>
            </Pressable>
          )) : (
            <View className="rounded-xl border border-border bg-card p-6">
              <Text className="text-base font-semibold">No threads yet</Text>
              <Text className="mt-2 text-sm text-muted-foreground">Create a conversation to start messaging.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="pb-6">
        <Button onPress={() => (router.push as (href: string) => void)("/chat/new")}>
          <Text>Start New Chat</Text>
        </Button>
      </View>
    </View>
  );
}
