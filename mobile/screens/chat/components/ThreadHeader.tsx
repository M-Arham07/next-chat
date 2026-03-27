import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ThreadHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ThreadHeader({ searchQuery, onSearchChange }: ThreadHeaderProps) {
  const [focused, setFocused] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background border-b border-border px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Title row */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          Threads
        </Text>
        <TouchableOpacity
          className="p-2 rounded-xl bg-secondary"
          activeOpacity={0.7}
        >
          <Text className="text-lg text-muted-foreground">⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View
        className={cn(
          "flex-row items-center bg-secondary rounded-2xl border px-4 py-1 gap-x-2",
          focused ? "border-border/60" : "border-transparent"
        )}
      >
        <Text className="text-sm">🔍</Text>
        <Input
          className="flex-1 bg-transparent border-0 h-10 p-0 text-sm"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search conversations..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => onSearchChange("")} activeOpacity={0.7}>
            <Text className="text-sm text-muted-foreground">✕</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center gap-x-1">
            <Text className="text-xs text-muted-foreground">✦ AI</Text>
          </View>
        )}
      </View>
    </View>
  );
}
