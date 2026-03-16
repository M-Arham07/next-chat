import React, { useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";

/**
 * Avatar — Native equivalent of shadcn/ui Avatar with Radix primitives.
 * Replaces: @radix-ui/react-avatar (Root, Image, Fallback)
 * Why: Radix is web-only; this uses expo-image with manual fallback logic.
 * Closest match: same sizing, ring, rounded-full appearance.
 */

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

export function Avatar({ className, children }: AvatarProps) {
  return (
    <View
      className={cn(
        "relative h-8 w-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
    >
      {children}
    </View>
  );
}

interface AvatarImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export function AvatarImage({
  src,
  alt,
  className,
  onError,
  onLoad,
}: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <Image
      source={{ uri: src }}
      alt={alt}
      className={cn("h-full w-full", className)}
      contentFit="cover"
      onError={() => {
        setFailed(true);
        onError?.();
      }}
      onLoad={() => onLoad?.()}
    />
  );
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

export function AvatarFallback({ className, children }: AvatarFallbackProps) {
  return (
    <View
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-full bg-muted",
        className
      )}
    >
      {typeof children === "string" ? (
        <Text className="text-foreground text-sm font-medium">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
