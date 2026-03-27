import * as React from "react";
import { View, Image, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface AvatarProps extends ViewProps {
  uri?: string;
  fallback?: string;
  size?: number;
}

const Avatar = ({ uri, fallback = "?", size = 40, className, ...props }: AvatarProps) => (
  <View
    className={cn("items-center justify-center rounded-full bg-muted overflow-hidden", className)}
    style={{ width: size, height: size, borderRadius: size / 2 }}
    {...props}
  >
    {uri ? (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    ) : (
      <Text className="text-foreground font-semibold" style={{ fontSize: size * 0.4 }}>
        {fallback.charAt(0).toUpperCase()}
      </Text>
    )}
  </View>
);

export { Avatar };
