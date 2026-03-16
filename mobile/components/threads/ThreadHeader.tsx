import React from "react";
import { View, Text, Pressable } from "react-native";
import { Search, PenSquare } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useRouter } from "expo-router";

interface ThreadHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  // Mocking session since NextAuth is not native
  session?: { user: { username: string; image?: string } } | null;
}

export function ThreadHeader({ searchQuery, onSearchChange, session }: ThreadHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-4 py-3 bg-background border-b border-border/40">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={session?.user?.image} />
            <AvatarFallback>{session?.user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <Text className="text-xl font-bold tracking-tight text-foreground">Messages</Text>
        </View>

        <Pressable 
          onPress={() => router.push("/chat/new")}
          className="h-10 w-10 items-center justify-center rounded-xl bg-secondary/50"
        >
          <PenSquare size={20} color="#f5f5f5" />
        </Pressable>
      </View>

      <View className="relative justify-center">
        <Search size={18} color="#737373" className="absolute left-3 z-10" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={onSearchChange}
          className="h-[42px] rounded-full border-border bg-secondary/40 pl-10 pr-4 text-[15px] text-foreground"
          placeholderTextColor="#737373"
        />
      </View>
    </View>
  );
}
