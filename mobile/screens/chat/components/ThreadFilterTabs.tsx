import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ActiveFilter } from "@/features/chat/types/active-filter";

const FILTERS: ActiveFilter[] = ["all", "unread", "groups"];

interface ThreadFilterTabsProps {
  activeFilter: ActiveFilter;
  onFilterChange: (value: ActiveFilter) => void;
}

export default function ThreadFilterTabs({ activeFilter, onFilterChange }: ThreadFilterTabsProps) {
  return (
    <View className="px-4 py-2.5">
      <View className="flex-row self-start bg-secondary border border-border rounded-full p-1 gap-x-1">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => onFilterChange(filter)}
              activeOpacity={0.8}
              className={cn(
                "px-4 py-2 rounded-full",
                isActive ? "bg-accent" : "bg-transparent"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium capitalize",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
