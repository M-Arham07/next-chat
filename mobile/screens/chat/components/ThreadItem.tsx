import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Message, Thread, participant } from "@chat/shared";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatTime } from "@/lib/format-time";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-violet-600", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
];

export default function ThreadItem({ thread }: { thread: Thread }) {
  const router = useRouter();
  const { profile } = useAuth();
  const { messages, typingUsers } = useChatApp();

  const colorIdx =
    thread.threadId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;

  const typingSet = typingUsers?.[thread.threadId];
  const typingUserId = typingSet ? [...typingSet].at(-1) : undefined;
  const typingUsername = thread.participants?.find((p) => p.userId === typingUserId)?.username;

  const threadMsgs = messages?.[thread.threadId] ?? [];
  const lastMessage: Message | undefined = threadMsgs[threadMsgs.length - 1];

  let otherParticipant: participant | undefined;
  if (thread.type === "direct") {
    otherParticipant = thread.participants?.find(
      (p) => p.username.toLowerCase() !== profile?.username?.toLowerCase()
    );
  }

  const displayName = thread.groupName || otherParticipant?.username || "Unknown";
  const imageUrl = thread.groupImage || otherParticipant?.image;

  const previewText = typingUsername
    ? `${typingUsername} is typing…`
    : lastMessage?.type === "text"
    ? lastMessage.content.slice(0, 40)
    : lastMessage?.type ? `${lastMessage.type} message` : "No messages yet";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${thread.threadId}`)}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 gap-x-3 border-b border-border/40 active:bg-accent/50"
    >
      <Avatar uri={imageUrl} fallback={displayName} size={52} className={cn(!imageUrl && AVATAR_COLORS[colorIdx])} />
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-semibold text-foreground flex-1" numberOfLines={1}>{displayName}</Text>
          <Text className="text-xs text-muted-foreground ml-2 shrink-0">{formatTime(lastMessage?.timestamp)}</Text>
        </View>
        <Text className={cn("text-sm mt-0.5", typingUsername ? "text-primary italic" : "text-muted-foreground")} numberOfLines={1}>
          {previewText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
