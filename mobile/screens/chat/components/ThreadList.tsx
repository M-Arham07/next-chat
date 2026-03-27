import React from "react";
import { FlatList, View, ActivityIndicator } from "react-native";
import { Thread } from "@chat/shared";
import { Text } from "@/components/ui/text";
import ThreadItem from "./ThreadItem";

interface ThreadListProps {
  threads: Thread[] | null;
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-16 gap-y-3">
      <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center">
        <Text className="text-3xl">🔍</Text>
      </View>
      <Text className="text-sm text-muted-foreground">No conversations found</Text>
    </View>
  );
}

export default function ThreadList({ threads }: ThreadListProps) {
  if (!threads) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="hsl(240 5% 64.9%)" />
      </View>
    );
  }

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.threadId}
      renderItem={({ item }) => <ThreadItem thread={item} />}
      ListEmptyComponent={<EmptyState />}
      showsVerticalScrollIndicator={false}
      contentContainerClassName={threads.length === 0 ? "flex-1" : "pb-4"}
    />
  );
}
