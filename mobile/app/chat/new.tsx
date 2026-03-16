import React, { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable } from "react-native";
import { ArrowLeft, Search, Users } from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // This would typically fetch from `/api/search-users` from the Next.js backend
  const mockUsers = [
    { id: "1", username: "alex", displayName: "Alex Developer", image: undefined },
    { id: "2", username: "chris", displayName: "Chris UI", image: undefined },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <View className="flex-row items-center border-b border-border/40 bg-background/90 px-4 py-3 pb-4">
        <Pressable 
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50 active:bg-secondary/80"
        >
          <ArrowLeft size={24} color="#f5f5f5" />
        </Pressable>
        <Text className="text-xl font-bold tracking-tight text-foreground">New Message</Text>
      </View>

      <View className="px-4 py-4">
        <View className="relative justify-center">
          <Search size={18} color="#737373" className="absolute left-3 z-10" />
          <TextInput
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="h-[46px] rounded-2xl border border-border bg-secondary/40 pl-10 pr-4 text-[16px] text-foreground"
            placeholderTextColor="#737373"
            autoFocus
          />
        </View>
      </View>

      <Pressable 
        className="flex-row items-center gap-4 px-4 py-3 active:bg-accent/40 mb-2 border-b border-border/20"
        onPress={() => console.log('Create group mode')}
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Users size={24} color="#f5f5f5" />
        </View>
        <Text className="text-base font-medium text-foreground">Create a new group</Text>
      </Pressable>

      <Text className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Suggested Users
      </Text>

      <FlatList
        data={mockUsers}
        keyExtractor={u => u.id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 250, delay: index * 50 }}
          >
            <Pressable 
               className="flex-row items-center gap-3 px-4 py-3 active:bg-accent/40"
               onPress={() => {
                 // Create direct chat thread logic here
                 // router.push("/chat/temp-id");
               }}
            >
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={item.image} />
                <AvatarFallback>{item.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <View>
                <Text className="text-base font-semibold text-foreground">{item.displayName}</Text>
                <Text className="text-xs text-muted-foreground">@{item.username}</Text>
              </View>
            </Pressable>
          </MotiView>
        )}
      />
    </SafeAreaView>
  );
}
