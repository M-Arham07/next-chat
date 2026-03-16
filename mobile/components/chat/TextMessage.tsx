import React from "react";
import { View, Text } from "react-native";

export const TextMessage = ({ content }: { content: string }) => {
  return (
    <Text className="px-4 py-2 text-[15px] text-foreground leading-relaxed flex-shrink-1 flex-wrap">
      {content}
    </Text>
  );
};
