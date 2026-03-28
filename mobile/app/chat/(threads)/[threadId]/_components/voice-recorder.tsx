import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { Audio } from "expo-av";
import { Trash2, Play, Pause, Send, X, RefreshCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/useThemeColors";

interface VoiceRecorderProps {
  onSend: (audioUri: string) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTimer();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setError("Microphone permission required");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      startTimer();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setError("Failed to start recording");
      console.log("Recording error:", err);
    }
  };

  const togglePause = async () => {
    if (!recording) return;

    try {
      if (isPaused) {
        await recording.startAsync();
        startTimer();
      } else {
        await recording.pauseAsync();
        stopTimer();
      }
      setIsPaused(!isPaused);
    } catch (err) {
      console.log("Pause error:", err);
    }
  };

  const handleDelete = async () => {
    stopTimer();
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel();
  };

  const handleSend = async () => {
    if (!recording) return;

    try {
      stopTimer();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSend(uri);
      }
    } catch (err) {
      console.log("Send error:", err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <MotiView
        from={{ translateY: 20, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        className="absolute bottom-0 left-0 right-0 p-4 border-t"
        style={{
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        <View className="flex-row items-start gap-3">
          <View className="flex-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              {error}
            </Text>
          </View>
          <Pressable
            onPress={onCancel}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.secondary }}
          >
            <X size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={startRecording}
            className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <RefreshCcw size={16} color={colors.primaryForeground} />
            <Text
              className="text-sm font-medium"
              style={{ color: colors.primaryForeground }}
            >
              Try again
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            className="flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.secondary }}
          >
            <X size={16} color={colors.foreground} />
            <Text
              className="text-sm font-medium"
              style={{ color: colors.foreground }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ translateY: 20, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 p-4 border-t"
      style={{
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <View className="flex-row items-center justify-between gap-4">
        {/* Delete Button */}
        <Pressable
          onPress={handleDelete}
          className="p-3 rounded-full active:scale-95"
          style={{ backgroundColor: colors.secondary }}
        >
          <Trash2 size={24} color={colors.mutedForeground} />
        </Pressable>

        {/* Duration Display */}
        <View className="flex-1 items-center">
          <Text
            className="text-2xl font-bold tabular-nums"
            style={{ color: colors.foreground }}
          >
            {formatDuration(duration)}
          </Text>
          <Text className="text-xs" style={{ color: colors.mutedForeground }}>
            {isPaused ? "Paused" : "Recording..."}
          </Text>

          {/* Recording indicator */}
          {!isPaused && (
            <MotiView
              from={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 500,
                loop: true,
              }}
              className="w-2 h-2 rounded-full mt-2"
              style={{ backgroundColor: colors.destructive }}
            />
          )}
        </View>

        {/* Pause Button */}
        <Pressable
          onPress={togglePause}
          disabled={!isRecording}
          className="p-3 rounded-full active:scale-95"
          style={{ backgroundColor: colors.secondary }}
        >
          {isPaused ? (
            <Play size={24} color={colors.mutedForeground} />
          ) : (
            <Pause size={24} color={colors.mutedForeground} />
          )}
        </Pressable>

        {/* Send Button */}
        <Pressable
          onPress={handleSend}
          disabled={!isRecording}
          className="p-3 rounded-full active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <Send size={24} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </MotiView>
  );
}
