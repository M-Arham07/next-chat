import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Thread } from "@chat/shared";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { CreateThreadSchemaResponse } from "@chat/shared/schema";
import { debounce } from "@/lib/debounce";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { apiUrl } from "@/lib/api";
import { getSupabaseClient } from "@/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function isProfile(item: Profile | Thread): item is Profile {
  return "username" in item;
}

function UserRow({
  user, onChat, onAdd, isGroupCreationMode, isSelected,
}: {
  user: Profile;
  onChat: (id: string, name: string) => void;
  onAdd?: (u: Profile) => void;
  isGroupCreationMode: boolean;
  isSelected: boolean;
}) {
  const { profile } = useAuth();
  if (profile?.id === user.id) return null;
  return (
    <TouchableOpacity
      onPress={() => isGroupCreationMode ? onAdd?.(user) : onChat(user.id, user.username)}
      activeOpacity={0.75}
      className="flex-row items-center py-3 gap-x-3 border-b border-border/50 active:bg-accent/50"
    >
      <Avatar uri={user.image} fallback={user.username} size={44} className="bg-muted" />
      <View className="flex-1 min-w-0">
        <Text className="text-[15px] font-semibold text-foreground">{user.username}</Text>
        <Text className="text-xs text-muted-foreground">@{user.username}</Text>
      </View>
      <View className={cn(
        "px-3 py-1.5 rounded-xl border",
        isSelected ? "bg-primary border-primary" : "bg-secondary border-border"
      )}>
        <Text className={cn("text-xs font-semibold", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
          {isGroupCreationMode ? (isSelected ? "✓ Added" : "+ Add") : "Chat →"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NewChatScreen() {
  const router = useRouter();
  const { addThread } = useChatApp();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isGroupCreationMode, setIsGroupCreationMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const debouncedSetQuery = useRef(debounce((q: string) => setDebouncedQuery(q), 400)).current;

  const supabase = getSupabaseClient();
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? "";
  };

  const searchRoute = isGroupMode
    ? `threads?group_name=${debouncedQuery.toLowerCase()}`
    : `users?username=${debouncedQuery.toLowerCase()}`;

  const { data: results = [], isLoading, isError } = useQuery<(Profile | Thread)[]>({
    queryKey: ["search", searchRoute],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(apiUrl(`/api/search/${searchRoute}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const createThreadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = await getToken();
      const res = await fetch(apiUrl("/api/threads"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      const { success, createdThreadId } = CreateThreadSchemaResponse.parse(json);
      if (!success) throw new Error("Failed to create thread");
      return createdThreadId as string;
    },
  });

  const handleUserChat = async (userId: string, username: string) => {
    const fd = new FormData();
    fd.append("type", "direct");
    fd.append("otherParticipantUserIds", JSON.stringify([userId]));
    try {
      const threadId = await createThreadMutation.mutateAsync(fd);
      router.replace(`/chat/${threadId}`);
    } catch {
      Alert.alert("Error", `Failed to start chat with ${username}`);
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length < 2) { Alert.alert("Error", "Select at least 2 users"); return; }
    Alert.prompt("Group Name", "Enter a name for this group", async (name) => {
      if (!name?.trim()) return;
      const fd = new FormData();
      fd.append("type", "group");
      fd.append("otherParticipantUserIds", JSON.stringify(selectedUsers.map((u) => u.id)));
      fd.append("groupName", name.trim());
      try {
        const threadId = await createThreadMutation.mutateAsync(fd);
        router.replace(`/chat/${threadId}`);
      } catch {
        Alert.alert("Error", "Failed to create group");
      }
    });
  };

  const switchMode = (gMode: boolean) => {
    setIsGroupMode(gMode); setQuery(""); setDebouncedQuery(""); setSelectedUsers([]); setIsGroupCreationMode(false);
  };

  const profileResults = results.filter(isProfile);
  const threadResults = (results as Thread[]).filter((r) => !isProfile(r));

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text className="text-base font-semibold text-primary">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-foreground">New Message</Text>
        <View className="w-16" />
      </View>

      <View className="px-4 py-3">
        <Input
          value={query}
          onChangeText={(t) => { setQuery(t); debouncedSetQuery(t); }}
          placeholder={isGroupMode ? "Search groups…" : "Search users…"}
          autoCapitalize="none"
          autoFocus
        />
      </View>

      <View className="flex-row px-4 gap-x-2 mb-2">
        {[{ label: "👤 Users", gMode: false }, { label: "👥 Groups", gMode: true }].map(({ label, gMode }) => (
          <TouchableOpacity
            key={label} onPress={() => switchMode(gMode)} activeOpacity={0.8}
            className={cn("px-4 py-2 rounded-full border", isGroupMode === gMode ? "bg-primary border-primary" : "bg-secondary border-border")}
          >
            <Text className={cn("text-sm font-semibold", isGroupMode === gMode ? "text-primary-foreground" : "text-muted-foreground")}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isGroupCreationMode && selectedUsers.length > 0 && (
        <View className="flex-row flex-wrap px-4 gap-2 mb-2">
          {selectedUsers.map((u) => (
            <TouchableOpacity key={u.id}
              onPress={() => setSelectedUsers((prev) => prev.filter((x) => x.id !== u.id))}
              className="flex-row items-center gap-x-1 px-3 py-1.5 bg-secondary border border-border rounded-full"
            >
              <Text className="text-sm text-foreground">{u.username}</Text>
              <Text className="text-xs text-muted-foreground">✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="hsl(240 5% 64.9%)" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-destructive">Something went wrong</Text>
        </View>
      ) : (
        <FlatList
          data={isGroupMode ? threadResults : profileResults}
          keyExtractor={(item) => isProfile(item) ? item.id : (item as Thread).threadId}
          contentContainerClassName="px-4 pb-32"
          renderItem={({ item }) => isProfile(item) ? (
            <UserRow user={item} onChat={handleUserChat} onAdd={(u) => setSelectedUsers((prev) => prev.some((x) => x.id === u.id) ? prev : [...prev, u])}
              isGroupCreationMode={isGroupCreationMode} isSelected={selectedUsers.some((u) => u.id === item.id)} />
          ) : (
            <TouchableOpacity className="flex-row items-center py-3 gap-x-3 border-b border-border/50" activeOpacity={0.75}>
              <Avatar fallback={(item as Thread).groupName ?? "G"} size={44} className="bg-muted" />
              <View>
                <Text className="text-[15px] font-semibold text-foreground">{(item as Thread).groupName}</Text>
                <Text className="text-xs text-muted-foreground">{(item as Thread).participants?.length ?? 0} members</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={debouncedQuery.length > 0 ? (
            <View className="items-center pt-10">
              <Text className="text-sm text-muted-foreground">{isGroupMode ? "No groups found" : "No users found"}</Text>
            </View>
          ) : null}
        />
      )}

      {!isGroupMode && (
        <View className="absolute bottom-6 left-4 right-4">
          {!isGroupCreationMode ? (
            <TouchableOpacity onPress={() => setIsGroupCreationMode(true)} activeOpacity={0.8}
              className="items-center py-4 rounded-2xl border border-dashed border-border bg-secondary">
              <Text className="text-[15px] font-semibold text-foreground">＋ Create a Group</Text>
            </TouchableOpacity>
          ) : (
            <Button
              onPress={handleCreateGroup}
              disabled={selectedUsers.length < 2 || createThreadMutation.isPending}
            >
              <Text>
                {createThreadMutation.isPending ? "Creating…" : `Create Group (${selectedUsers.length} selected)`}
              </Text>
            </Button>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
