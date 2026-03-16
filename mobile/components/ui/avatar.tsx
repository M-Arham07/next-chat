import React from "react";
import {
  Image,
  View,
  Text,
  ViewStyle,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "@/lib/use-theme";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  initials?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function Avatar({
  source,
  initials,
  size = "md",
  style,
}: AvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZES[size];

  return (
    <View
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: source ? "transparent" : colors.muted,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: dimension, height: dimension }}
        />
      ) : (
        initials && (
          <Text
            style={{
              fontSize: FONT_SIZES[size],
              fontWeight: "600",
              color: colors.card,
            }}
          >
            {initials}
          </Text>
        )
      )}
    </View>
  );
}
