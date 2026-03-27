import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  isSent?: boolean;
  displayPicUrl?: string;
  username?: string;
}

function Dot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(300),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      className="w-2 h-2 rounded-full bg-muted-foreground"
      style={{ transform: [{ translateY: anim }] }}
    />
  );
}

export default function TypingIndicator({
  isSent = false,
  displayPicUrl,
  username,
}: TypingIndicatorProps) {
  return (
    <View
      className={cn(
        "flex-row items-end px-4 py-1 gap-x-2",
        isSent ? "justify-end" : "justify-start"
      )}
    >
      {!isSent && (
        <Avatar
          uri={displayPicUrl}
          fallback={username ?? "?"}
          size={24}
          className="mb-1 bg-muted"
        />
      )}

      <View
        className={cn(
          "flex-row items-center gap-x-1 px-4 py-3 rounded-2xl border border-border/40",
          isSent
            ? "bg-secondary rounded-br-sm"
            : "bg-card rounded-bl-sm"
        )}
      >
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}
