"use client";

import { useState } from "react";
import ImageViewer from "./image-viewer";
import { Image } from "expo-image";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import { ActivityIndicator, Pressable, View, Text } from "react-native";

interface ImageMessageProps {
  msgId: string;
  imageUrl: string;
  status?: string;
}

const ImageMessage = ({ msgId, imageUrl, status }: ImageMessageProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const progress = useChatAppStore((s) => s.uploadingProgress?.[msgId] || 0);

  const handlePress = () => {
    if (status !== "sending") {
      setIsImageViewerOpen(true);
    }
  };

  return (
    <>
      <View className="p-1 relative">
        <Pressable onPress={handlePress} disabled={status === "sending"}>
          <Image
            source={{ uri: imageUrl || undefined }}
            style={{ width: "100%", height: 200, borderRadius: 16 }}
            contentFit="cover"
          />
        </Pressable>
        {status === "sending" && (
          <View className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70">
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="text-xs font-bold text-white">{progress}%</Text>
          </View>
        )}
      </View>
      <ImageViewer imageUrl={imageUrl || ""} isOpen={isImageViewerOpen} onClose={() => setIsImageViewerOpen(false)} />
    </>
  );
};

export default ImageMessage;
