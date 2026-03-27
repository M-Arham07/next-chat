import React from "react";
import { View } from "react-native";
import { Link } from "expo-router";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { ActiveFilter } from "@/features/chat/types/active-filter";
import ThreadHeader from "@/screens/chat/components/ThreadHeader";
import ThreadFilterTabs from "@/screens/chat/components/ThreadFilterTabs";
import ThreadList from "@/screens/chat/components/ThreadList";
import { Text } from "@/components/ui/text";
import { TouchableOpacity } from "react-native";

export default function ThreadsTab() {
  const { searchQuery, filteredThreads, set, activeFilter } = useChatApp();

  return (
    <View className="flex-1 bg-background">
      <ThreadHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => set("searchQuery", q)}
      />
      <ThreadFilterTabs
        activeFilter={activeFilter}
        onFilterChange={(val: ActiveFilter) => set("activeFilter", val)}
      />

      <View className="flex-1">
        <ThreadList threads={filteredThreads} />
      </View>

      {/* FAB */}
      <Link href="/chat/new" asChild>
        <TouchableOpacity
          activeOpacity={0.85}
          className="absolute bottom-6 right-4 w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-lg z-20"
        >
          <Text className="text-3xl text-primary-foreground leading-none">＋</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
