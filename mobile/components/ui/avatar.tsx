import React from "react";
import {
  Image,
  View,
  Text,
  ViewStyle,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "@/lib/use-theme";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  initials?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  colorIndex?: number;
}

const AVATAR_COLORS = [
  "rgb(200 180 170)", // avatar-gray-1
  "rgb(180 170 160)", // avatar-gray-2
  "rgb(160 150 140)", // avatar-gray-3
  "rgb(140 130 120)", // avatar-gray-4
  "rgb(120 110 100)", // avatar-gray-5
];

const SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
};

export function Avatar({
  source,
  initials,
  size = "md",
  style,
  colorIndex = 0,
}: AvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZES[size];
  const avatarColor =
    AVATAR_COLORS[colorIndex % AVATAR_COLORS.length] || AVATAR_COLORS[0];

  return (
    <View
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: source ? "transparent" : avatarColor,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
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
