import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import { useUniwind } from 'uniwind';
import { PlayIcon, PauseIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

const BAR_COUNT = 28;
const BAR_HEIGHT_RANGE = [6, 34];

interface VoiceMessageBubbleProps {
  msgId: string;
  voiceUrl: string;
  status?: string;
  uploadProgress?: number;
}

export function VoiceMessageBubble({
  msgId,
  voiceUrl,
  status,
  uploadProgress = 0,
}: VoiceMessageBubbleProps) {
  const { colors } = useUniwind();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bars, setBars] = useState<number[]>(
    Array.from({ length: BAR_COUNT }, () => 22)
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<any>(null);

  const isUploading = status === 'sending';

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateBars = () => {
    // Generate animated bars based on time
    const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
      const baseHeight = 10 + ((i * 7 + Date.now() / 120) % 14);
      if (isPlaying) {
        return baseHeight + Math.sin((i + currentTime) * 0.1) * 8;
      }
      return baseHeight;
    });
    setBars(newBars);
  };

  const loadSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: voiceUrl,
      });

      soundRef.current = sound;

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        setIsLoaded(true);

        sound.setOnPlaybackStatusUpdate((playStatus) => {
          if (playStatus.isLoaded) {
            setCurrentTime(playStatus.positionMillis / 1000);

            if (playStatus.didJustFinish) {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  useEffect(() => {
    loadSound();
  }, [voiceUrl]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(updateBars, 30);
    } else {
      if (animationRef.current) clearInterval(animationRef.current);
    }
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isPlaying, currentTime]);

  const handleTogglePlay = async () => {
    if (isUploading || !isLoaded) return;

    try {
      if (!soundRef.current) {
        await loadSound();
        return;
      }

      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View className="flex-row items-center gap-3 px-3 py-2 rounded-xl w-full max-w-xs">
      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={handleTogglePlay}
        disabled={isUploading || !isLoaded}
        className="p-2 rounded-full items-center justify-center shrink-0"
        style={{
          backgroundColor: isUploading
            ? `${colors.muted}40`
            : `${colors.primary}20`,
        }}
      >
        {isUploading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : isPlaying ? (
          <PauseIcon className="w-4 h-4" color={colors.primary} />
        ) : (
          <PlayIcon className="w-4 h-4" color={colors.primary} />
        )}
      </TouchableOpacity>

      {/* Waveform Visualization */}
      <View className="flex-1 flex-row items-center gap-0.5 h-8">
        {bars.map((height, i) => (
          <View
            key={i}
            style={{
              height: Math.max(6, height),
              backgroundColor: isUploading
                ? `${colors.muted}60`
                : `${colors.primary}80`,
              borderRadius: 1,
              flex: 1,
            }}
          />
        ))}
      </View>

      {/* Time Display */}
      <View className="items-end shrink-0">
        <Text className="text-xs text-muted-foreground font-medium">
          {isUploading ? `${uploadProgress}%` : formatTime(duration - currentTime)}
        </Text>
      </View>
    </View>
  );
}
