import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { Audio } from "expo-av";
import { Play, Pause } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import { formatTime } from "@/lib/format-time";

export function VoiceMessage({ msgId, voiceUrl, status }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const progressPercent = useChatAppStore((s) => s.uploadingProgress?.[msgId] || 0);

  async function loadSound() {
    try {
      if (status === "sending") return;
      const { sound: newSound, status: playbackStatus } = await Audio.Sound.createAsync(
        { uri: voiceUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      if (playbackStatus.isLoaded && playbackStatus.durationMillis) {
        setDuration(playbackStatus.durationMillis / 1000);
      }
    } catch (e) {
      console.error("Error loading voice message", e);
    }
  }

  useEffect(() => {
    loadSound();
    return () => {
      sound?.unloadAsync();
    };
  }, [voiceUrl, status]);

  const onPlaybackStatusUpdate = (playbackStatus: any) => {
    if (playbackStatus.isLoaded) {
      setPosition(playbackStatus.positionMillis / 1000);
      setIsPlaying(playbackStatus.isPlaying);
      if (playbackStatus.didJustFinish) {
        setIsPlaying(false);
        sound?.setPositionAsync(0);
        setPosition(0);
      }
    }
  };

  const togglePlayback = async () => {
    if (!sound) await loadSound();
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const remaining = Math.max(0, duration - position);
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  // Render dummy bars since we don't have AudioContext for live visualizers
  const BAR_COUNT = 28;
  const dummyBars = Array.from({ length: BAR_COUNT }, (_, i) => 10 + (i % 14));

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-glass-border bg-background/60 px-3 py-2">
      <Avatar className="h-9 w-9 bg-muted">
        <Text className="text-xs font-semibold text-foreground text-center mt-2.5">M</Text>
      </Avatar>

      {status === "sending" ? (
        <View className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary">
          <Text className="text-[10px] font-bold text-foreground">{progressPercent}%</Text>
        </View>
      ) : (
        <Pressable
          onPress={togglePlayback}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/40"
        >
          {isPlaying ? <Pause size={20} color="#f5f5f5" /> : <Play size={20} color="#f5f5f5" className="ml-1" />}
        </Pressable>
      )}

      <View className="flex-1 overflow-hidden ml-1">
        <View className="relative h-10 w-full overflow-hidden rounded-xl bg-muted/30 px-2 justify-center">
          <View className="absolute left-0 h-full bg-primary/10" style={{ width: `${progressRatio * 100}%` }} />
          <View className="flex-row items-center justify-between h-full space-x-0.5 max-w-[200px]">
             {dummyBars.map((h, i) => (
                <View
                  key={i}
                  className={`w-0.5 rounded-full ${i < (progressRatio * dummyBars.length) ? 'bg-primary/80' : 'bg-muted-foreground/60'}`}
                  style={{ height: h, width: 2 }}
                />
             ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-1 px-1">
          <Text className="font-mono text-xs text-foreground/90">
            {formatTime(remaining * 1000).replace(/ AM| PM|:\d\d /, '') || "0:00"}
          </Text>
          <Text className="text-[11px] text-muted-foreground">
            {duration ? formatTime(duration * 1000).replace(/ AM| PM|:\d\d /, '') : "0:00"}
          </Text>
        </View>
      </View>
    </View>
  );
}
