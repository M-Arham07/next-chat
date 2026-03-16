import React, { useState } from "react";
import { View, FlatList, Text } from "react-native";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import filterThreads from "@/features/chat/lib/filter-threads";
import { ThreadHeader } from "@/components/threads/ThreadHeader";
import { ThreadFilterTabs } from "@/components/threads/ThreadFilterTabs";
import { ThreadItem } from "@/components/threads/ThreadItem";
import { FloatingActionButton } from "@/components/threads/FloatingActionButton";
import { ActiveFilter } from "@/features/chat/types";

export default function ChatIndexScreen() {
  const { threads, messages, typingUsers } = useChatAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const mockSession = { user: { username: "m_arham07" } };

  const filteredThreads = filterThreads(
    threads,
    messages,
    mockSession,
    searchQuery,
    activeFilter
  );

  return (
    <View className="flex-1 bg-background relative pt-4">
      {/* Header overrides normal RN Header */}
      <ThreadHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        session={mockSession}
      />
      
      <ThreadFilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <FlatList
        data={filteredThreads || []}
        keyExtractor={(item) => item.threadId}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for FAB
        initialNumToRender={15}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center p-8 mt-20">
            <Text className="text-muted-foreground text-center mb-2">
              No conversations found
            </Text>
            <Text className="text-xs text-muted-foreground opacity-60">
              Try a different filter or search term
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
           // Basic logic for getting "last" message
           const threadMsgs = messages?.[item.threadId] || [];
           const lastMsg = threadMsgs.length > 0 ? threadMsgs[threadMsgs.length - 1] : undefined;
           const isTyping = typingUsers?.[item.threadId];

           return (
             <ThreadItem
               thread={item}
               currentUsername={mockSession.user.username}
               lastMessage={lastMsg}
               typingUsers={isTyping}
             />
           );
        }}
      />

      <FloatingActionButton />
    </View>
  );
}
