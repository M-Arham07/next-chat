import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import { useAuthStore } from "@/lib/store/auth.store";
import { useChatStore, Thread } from "@/lib/store/chat.store";
import { useTheme } from "@/lib/use-theme";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ThreadsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { threads, setThreads, isLoading, setLoading } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    // Mock fetch threads
    loadThreads();
  }, [isAuthenticated]);

  useEffect(() => {
    const filtered = threads.filter(
      (thread) =>
        thread.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.participants.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredThreads(filtered);
  }, [threads, searchQuery]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockThreads: Thread[] = [
        {
          id: "1",
          name: "John Doe",
          type: "direct",
          unreadCount: 2,
          participants: [user?.id || "user1", "user2"],
          lastMessage: {
            id: "msg1",
            threadId: "1",
            userId: "user2",
            content: "That sounds great!",
            timestamp: new Date().toISOString(),
            read: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Design Team",
          type: "group",
          unreadCount: 0,
          participants: [user?.id || "user1", "user3", "user4"],
          lastMessage: {
            id: "msg2",
            threadId: "2",
            userId: "user3",
            content: "Sharing the latest mockups...",
            timestamp: new Date().toISOString(),
            read: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setThreads(mockThreads);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadPress = (threadId: string) => {
    router.push(`/(chat)/${threadId}`);
  };

  const renderThreadItem = ({ item }: { item: Thread }) => (
    <TouchableOpacity
      onPress={() => handleThreadPress(item.id)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Avatar
        initials={item.name.slice(0, 2).toUpperCase()}
        size="lg"
        colorIndex={parseInt(item.id)}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.unreadCount > 0 && (
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                minWidth: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.primaryForeground,
                }}
              >
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
        {item.lastMessage && (
          <Text
            style={{
              fontSize: 14,
              color: colors.mutedForeground,
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            Messages
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(chat)/new")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={24} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.input,
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={20} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search conversations"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              paddingHorizontal: 8,
              paddingVertical: 10,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>
      </View>

      {/* Threads List */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredThreads.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.accent,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 32 }}>💬</Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: colors.mutedForeground,
              textAlign: "center",
            }}
          >
            No conversations found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          renderItem={renderThreadItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => (
            <Separator style={{ marginVertical: 0, marginHorizontal: 16 }} />
          )}
          scrollEnabled
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      )}
    </SafeAreaView>
  );
}
