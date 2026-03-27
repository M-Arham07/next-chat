import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function DateSeparator({ date }: { date: string }) {
  return (
    <View className="items-center py-3">
      <View className="bg-secondary border border-border/50 px-4 py-1.5 rounded-full">
        <Text className="text-xs text-muted-foreground font-medium">{date}</Text>
      </View>
    </View>
  );
}
