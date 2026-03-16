import React, { useRef, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import { Play } from "lucide-react-native";

export function VideoMessage({ msgId, videoUrl, status }: any) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const progress = useChatAppStore(s => s.uploadingProgress?.[msgId] || 0);

  const { width } = Dimensions.get("window");
  const maxWidth = width * 0.7;
  
  const displayUrl = videoUrl;

  const togglePlay = async () => {
    if (status === "sending") return;
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  return (
    <View className="p-1 relative overflow-hidden rounded-xl bg-muted/20 border border-border/50">
      <Pressable onPress={togglePlay}>
        <Video
          ref={videoRef}
          source={{ uri: displayUrl }}
          style={{ width: maxWidth, aspectRatio: 16/9, borderRadius: 12, backgroundColor: 'black' }}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={(s: any) => {
            if (s.isLoaded) {
              setIsLoaded(true);
              setIsPlaying(s.isPlaying);
              if (s.didJustFinish) setIsPlaying(false);
            }
          }}
          useNativeControls={false}
        />

        {status === "sending" ? (
          <View className="absolute inset-0 flex-1 items-center justify-center bg-black/40 rounded-xl">
            <Text className="text-[10px] text-white/70 font-medium uppercase tracking-widest mt-2 bg-black/50 px-2 py-1 rounded">
              {progress < 50 ? "Optimizing..." : "Uploading..."} - {progress}%
            </Text>
          </View>
        ) : (
          !isPlaying && isLoaded && (
            <View className="absolute inset-0 flex-1 items-center justify-center bg-black/20 rounded-xl">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30">
                <Play size={24} color="white" fill="white" />
              </View>
            </View>
          )
        )}
      </Pressable>
    </View>
  );
}
