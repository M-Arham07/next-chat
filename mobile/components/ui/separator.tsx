import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/use-theme";

interface SeparatorProps {
  horizontal?: boolean;
  style?: ViewStyle;
}

export function Separator({ horizontal = true, style }: SeparatorProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.border,
        },
        horizontal
          ? { height: 1, marginVertical: 12 }
          : { width: 1, marginHorizontal: 12 },
        style,
      ]}
    />
  );
}
