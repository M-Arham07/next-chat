import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — Native equivalent of shadcn/ui Skeleton.
 * Replaces: CSS shimmer keyframe animation
 * Why: CSS @keyframes don't work in RN; uses Reanimated opacity pulse.
 * Closest match: same rounded shape, bg-muted color, pulse effect.
 */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn("rounded-md bg-muted", className)}
    />
  );
}
