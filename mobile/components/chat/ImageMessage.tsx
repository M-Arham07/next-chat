import React, { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export function ImageMessage({ msgId, imageUrl, status }: any) {
  const progress = useChatAppStore(s => s.uploadingProgress?.[msgId] || 0);

  // Fallback dimension logic for optimal mobile view
  const { width } = Dimensions.get("window");
  const maxWidth = width * 0.7;

  return (
    <View className="p-1 relative">
      <Pressable onPress={() => { /* Open ImageViewer modal */ }}>
        <Image
          source={imageUrl || "/placeholder.svg"}
          style={{ width: maxWidth, height: maxWidth * 0.75, borderRadius: 12 }}
          contentFit="cover"
          className={status === "sending" ? "opacity-40" : ""}
        />
      </Pressable>

      {status === "sending" && (
        <View className="absolute inset-0 flex-1 items-center justify-center bg-black/20 rounded-xl">
          <View className="items-center justify-center p-2 rounded-full bg-black/50">
            <Text className="text-white text-xs font-bold">{progress}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}
