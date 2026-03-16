import React from "react";
import { View, Text, Pressable } from "react-native";
import { ActiveFilter } from "@/features/chat/types";
import { MotiView } from "moti";

interface ThreadFilterTabsProps {
  activeFilter: ActiveFilter;
  onFilterChange: (value: ActiveFilter) => void;
}

const filters: ActiveFilter[] = ["all", "unread", "groups"];

export function ThreadFilterTabs({ activeFilter, onFilterChange }: ThreadFilterTabsProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 150 }}
      className="px-4 py-3"
    >
      <View className="flex-row items-center rounded-full border border-border/60 bg-background/60 p-1">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => onFilterChange(filter)}
              className="flex-1 items-center justify-center py-2"
            >
              {isActive && (
                <MotiView
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full border border-border/60 bg-accent/80"
                />
              )}
              <Text
                className={`text-sm font-medium capitalize z-10 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </MotiView>
  );
}
