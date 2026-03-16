import React from "react";
import { ActivityIndicator, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/use-theme";

type SpinnerSize = "small" | "large";

interface SpinnerProps {
  size?: SpinnerSize;
  style?: ViewStyle;
}

export function Spinner({ size = "large", style }: SpinnerProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ justifyContent: "center", alignItems: "center" }, style]}>
      <ActivityIndicator
        size={size}
        color={colors.primary}
      />
    </View>
  );
}
