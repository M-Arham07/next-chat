import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { useUniwind } from 'uniwind';
import { Text } from '@/components/ui/text';

interface ImageMessageBubbleProps {
  msgId: string;
  imageUrl: string;
  status?: string;
  uploadProgress?: number;
}

export function ImageMessageBubble({
  msgId,
  imageUrl,
  status,
  uploadProgress = 0,
}: ImageMessageBubbleProps) {
  const { colors } = useUniwind();
  const [imageVisible, setImageVisible] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 250, height: 250 });

  const handleImageLoad = (width: number, height: number) => {
    const maxWidth = 250;
    const ratio = height / width;
    const newWidth = Math.min(width, maxWidth);
    const newHeight = newWidth * ratio;
    setImageSize({ width: newWidth, height: newHeight });
  };

  const isUploading = status === 'sending';
  const screenWidth = Dimensions.get('window').width;

  return (
    <>
      <TouchableOpacity
        onPress={() => !isUploading && setImageVisible(true)}
        activeOpacity={isUploading ? 1 : 0.7}
        className="p-1 rounded-xl overflow-hidden relative"
      >
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: imageSize.width,
            height: imageSize.height,
            borderRadius: 12,
            opacity: isUploading ? 0.5 : 1,
          }}
          onLoad={(e) => {
            const { width, height } = e.nativeEvent.source;
            handleImageLoad(width, height);
          }}
        />

        {isUploading && (
          <View className="absolute inset-0 rounded-xl items-center justify-center bg-black/20">
            <View className="items-center gap-2">
              <ActivityIndicator color={colors.primary} size="large" />
              <Text className="text-xs text-white font-medium">{uploadProgress}%</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={imageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <TouchableOpacity
            onPress={() => setImageVisible(false)}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 }}
          >
            <Text className="text-white text-2xl font-bold">✕</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: screenWidth - 32,
                height: screenWidth - 32,
                resizeMode: 'contain',
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
