import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Audio } from "expo-av";
import { Play, Pause } from "lucide-react-native";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";

interface VoiceMessageProps {
  voiceUrl: string;
}

export function VoiceMessage({ voiceUrl }: VoiceMessageProps) {
  const colors = useThemeColors();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAndPlay = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: voiceUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Error playing audio:", error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View className="flex-row items-center p-3 gap-3 min-w-[180px]">
      {/* Play/Pause Button */}
      <Pressable
        onPress={loadAndPlay}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        {isPlaying ? (
          <Pause size={18} color={colors.primaryForeground} />
        ) : (
          <Play size={18} color={colors.primaryForeground} style={{ marginLeft: 2 }} />
        )}
      </Pressable>

      {/* Waveform / Progress */}
      <View className="flex-1">
        <View
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.muted }}
        >
          <MotiView
            animate={{ width: `${progress}%` }}
            transition={{ type: "timing", duration: 100 }}
            className="h-full rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        </View>

        <Text
          className="text-xs mt-1"
          style={{ color: colors.mutedForeground }}
        >
          {formatDuration(position)} / {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}
