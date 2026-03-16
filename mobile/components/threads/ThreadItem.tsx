import React from "react";
import { View, Text, Pressable } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Thread, Message } from "@chat/shared";
import { formatTime } from "@/lib/format-time";
import { Users, Check, CheckCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";

interface ThreadItemProps {
  thread: Thread;
  lastMessage?: Message;
  currentUsername?: string;
  typingUsers?: Set<string>;
  onClick?: () => void;
}

export function ThreadItem({
  thread,
  lastMessage,
  currentUsername,
  typingUsers,
  onClick,
}: ThreadItemProps) {
  const router = useRouter();
  
  // Logic very similar to web snippet
  const isGroup = thread.type === "group";
  const otherUser = isGroup ? null : thread.particpants.find((p) => p.username !== currentUsername);

  const title = isGroup 
    ? thread.groupName 
    : otherUser?.username || "Unknown User";

  const image = isGroup 
    ? thread.groupImage || undefined
    : otherUser?.image;

  const isMe = lastMessage?.sender === currentUsername;

  const handlePress = () => {
    if (onClick) onClick();
    router.push(`./chat/${thread.threadId}`);
  };

  const isSomeoneTyping = typingUsers && typingUsers.size > 0;
  const isSelected = false; // Add active logic if you do a split pane for iPad in the future

  return (
    <Pressable
      onPress={handlePress}
      className={`mx-2 mb-1 flex-row items-center gap-3 rounded-2xl p-3 transition-colors ${
        isSelected ? "bg-accent/80" : "hover:bg-accent/40 active:bg-accent/60"
      }`}
    >
      <View className="relative">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={image} />
          <AvatarFallback className="bg-gradient-to-br from-muted to-secondary">
            {isGroup ? <Users size={20} color="#a6a6a6" /> : title?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Fake unread badge for demonstration based on typing */}
        {isGroup && (
          <View className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs">
             <Text className="text-[10px] text-foreground font-medium">{thread.particpants.length}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 overflow-hidden">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {lastMessage?.timestamp && (
             <Text className="text-xs text-muted-foreground">
               {formatTime(lastMessage.timestamp)}
             </Text>
          )}
        </View>

        <View className="flex-row items-center gap-1.5">
          {isSomeoneTyping ? (
            <Text className="text-sm font-medium text-emerald-500 italic" numberOfLines={1}>
              typing...
            </Text>
          ) : lastMessage ? (
            <View className="flex-1 flex-row items-center gap-1.5 opacity-80">
               {isMe && (
                 lastMessage.status === "sending" ? (
                   <Check size={14} color="#737373" />
                 ) : (
                   <CheckCheck size={14} color={lastMessage.readBy ? "#3b82f6" : "#737373"} />
                 )
               )}
               <Text className="flex-1 text-[13px] text-muted-foreground" numberOfLines={1}>
                 {isMe ? "You: " : ""}{lastMessage.type === "text" ? lastMessage.content : `[${lastMessage.type}]`}
               </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground italic">No messages yet</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
