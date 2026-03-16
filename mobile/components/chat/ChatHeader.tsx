import React from "react";
import { View, Text, Pressable } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Thread } from "@chat/shared";
import { ArrowLeft, UserCircle, Users, Check, Phone, Video, MoreVertical } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ChatHeaderProps {
  thread?: Thread;
  currentUsername: string;
  typingUsers?: Set<string>;
}

export function ChatHeader({ thread, currentUsername, typingUsers }: ChatHeaderProps) {
  const router = useRouter();

  if (!thread) return null;

  const isGroup = thread.type === "group";
  const otherUser = isGroup ? null : thread.particpants.find(p => p.username !== currentUsername);
  
  const title = isGroup ? thread.groupName : otherUser?.username || "Unknown User";
  const image = isGroup ? thread.groupImage : otherUser?.image;

  const isSomeoneTyping = typingUsers && typingUsers.size > 0;
  let statusText = isGroup ? `${thread.particpants.length} members` : "Last seen recently";

  if (isSomeoneTyping) {
    statusText = isGroup 
      ? `${Array.from(typingUsers)[0]} is typing...`
      : "typing...";
  }

  return (
    <View className="flex-row items-center justify-between border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur-2xl">
      <View className="flex-row items-center gap-4">
        <Pressable 
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50 active:bg-secondary/80"
        >
          <ArrowLeft size={24} color="#f5f5f5" />
        </Pressable>

        <Pressable className="flex-row items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={image} />
            <AvatarFallback className="bg-gradient-to-br from-muted to-secondary">
              {isGroup ? <Users size={20} color="#a6a6a6" /> : <UserCircle size={20} color="#a6a6a6" />}
            </AvatarFallback>
          </Avatar>
          
          <View className="justify-center gap-0.5">
            <Text className="text-base font-semibold tracking-tight text-foreground" numberOfLines={1}>
              {title}
            </Text>
            <Text className={`text-xs ${isSomeoneTyping ? 'text-emerald-500 font-medium italic' : 'text-muted-foreground'}`}>
              {statusText}
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50 active:bg-secondary/80">
          <Phone size={20} color="#a6a6a6" />
        </Pressable>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50 active:bg-secondary/80">
          <Video size={20} color="#a6a6a6" />
        </Pressable>
        {isGroup && (
          <Pressable className="ml-1 h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50 active:bg-secondary/80">
            <MoreVertical size={20} color="#a6a6a6" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
