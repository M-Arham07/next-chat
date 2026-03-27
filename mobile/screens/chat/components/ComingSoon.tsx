import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-y-3 bg-background">
      <Text className="text-5xl">🚧</Text>
      <Text className="text-xl font-bold text-foreground capitalize">{title}</Text>
      <Text className="text-sm text-muted-foreground">This section is coming soon</Text>
    </View>
  );
}
