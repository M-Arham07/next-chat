import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";

interface ChatHeaderProps {
  username?: string;
  image?: string;
  status?: string;
}

export default function ChatHeader({ username = "Loading…", image, status = "online" }: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-row items-center px-2 pb-3 bg-background/90 border-b border-border gap-x-2"
      style={{ paddingTop: insets.top + 8 }}>
      <TouchableOpacity onPress={() => router.back()}
        className="w-10 h-10 rounded-full items-center justify-center bg-secondary" activeOpacity={0.7}>
        <Text className="text-2xl text-foreground leading-none">‹</Text>
      </TouchableOpacity>
      <Avatar uri={image} fallback={username} size={40} className="bg-muted" />
      <View className="flex-1 min-w-0">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{username}</Text>
        <Text className="text-xs text-muted-foreground">{status}</Text>
      </View>
      <View className="flex-row gap-x-1">
        {["📹", "📞", "⋯"].map((icon) => (
          <TouchableOpacity key={icon} className="w-10 h-10 rounded-full items-center justify-center bg-secondary" activeOpacity={0.7}>
            <Text className="text-base">{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
