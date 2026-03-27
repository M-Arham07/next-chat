import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useState, useRef } from 'react';
import { useUniwind } from 'uniwind';
import { PlayIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

interface VideoMessageBubbleProps {
  msgId: string;
  videoUrl: string;
  status?: string;
  uploadProgress?: number;
}

export function VideoMessageBubble({
  msgId,
  videoUrl,
  status,
  uploadProgress = 0,
}: VideoMessageBubbleProps) {
  const { colors } = useUniwind();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const videoRef = useRef<Video>(null);

  const isUploading = status === 'sending';

  const formatDuration = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isUploading) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadComplete = (status: any) => {
    if (status.durationMillis) {
      setDuration(status.durationMillis / 1000);
    }
    setIsLoaded(true);
  };

  const screenWidth = Dimensions.get('window').width;
  const videoWidth = Math.min(250, screenWidth - 32);
  const videoHeight = (videoWidth / 16) * 9;

  return (
    <>
      <TouchableOpacity
        onPress={handlePlayPause}
        activeOpacity={isUploading ? 1 : 0.7}
        className="rounded-xl overflow-hidden bg-black"
        style={{ width: videoWidth, height: videoHeight, position: 'relative' }}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={{
            width: '100%',
            height: '100%',
            opacity: isUploading ? 0.4 : 1,
          }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlayStatusUpdate={handleLoadComplete}
        />

        {isUploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <View className="items-center gap-2">
              <ActivityIndicator color="white" size="large" />
              <Text className="text-xs text-white font-medium">{uploadProgress}%</Text>
            </View>
          </View>
        )}

        {!isPlaying && isLoaded && !isUploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/20">
            <PlayIcon className="w-12 h-12 text-white" fill="white" />
          </View>
        )}

        {isLoaded && !isUploading && (
          <View className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur">
            <Text className="text-xs text-white font-bold">{formatDuration(duration)}</Text>
          </View>
        )}

        {isLoaded && !isUploading && (
          <View className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur">
            <Text className="text-xs text-white font-bold">Video</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={fullscreenVisible}
        transparent
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <TouchableOpacity
            onPress={() => setFullscreenVisible(false)}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 16 }}
          >
            <Text className="text-white text-lg font-bold">✕</Text>
          </TouchableOpacity>
          <Video
            source={{ uri: videoUrl }}
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping={false}
          />
        </View>
      </Modal>
    </>
  );
}
