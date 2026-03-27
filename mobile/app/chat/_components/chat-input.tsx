import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useUniwind } from 'uniwind';
import { useState, useRef, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { VoiceRecorder } from './voice-recorder';
import {
  PaperclipIcon,
  CameraIcon,
  MicIcon,
  SendIcon,
} from '@/components/ui/icon';

interface ChatInputProps {
  onSend: (type: 'text' | 'image' | 'video' | 'voice' | 'document', content: string | Blob) => void;
  onTyping: () => void;
}

export function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const { colors } = useUniwind();
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<any>(null);

  const handleSubmit = useCallback(() => {
    if (!messageText.trim()) return;

    onSend('text', messageText);
    setMessageText('');
  }, [messageText, onSend]);

  const handleRecordingSend = useCallback(
    (audioBlob: Blob) => {
      onSend(
        'voice',
        new File([audioBlob], `recording-${Date.now()}.m4a`, {
          type: 'audio/mp4',
        })
      );
      setIsRecording(false);
    },
    [onSend]
  );

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        // Convert uri to File
        const response = await fetch(asset.uri);
        const blob = await response.blob();
      const file = new File(
          [blob],
          asset.fileName || `image-${Date.now()}.jpg`,
          { type: blob.type }
        );
        onSend('image', blob);
      }
    }
  }, [onSend]);

  const handleTakePhoto = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.cancelled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File(
          [blob],
          asset.fileName || `photo-${Date.now()}.jpg`,
          { type: blob.type }
        );
        onSend('image', blob);
      }
    }
  }, [onSend]);

  const handleAttachFile = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        // Detect file type
        const fileName = asset.fileName?.toLowerCase() || '';
        const isImage = asset.uri.includes('image');
        const isVideo = asset.uri.includes('video');

        let fileType: 'image' | 'video' | 'document' = 'document';
        if (isImage || blob.type.startsWith('image/')) {
          fileType = 'image';
        } else if (isVideo || blob.type.startsWith('video/')) {
          fileType = 'video';
        }

        const file = new File(
          [blob],
          asset.fileName || `file-${Date.now()}`,
          { type: blob.type }
        );

        onSend(fileType, blob);
      }
    }
  }, [onSend]);

  if (isRecording) {
    return (
      <VoiceRecorder
        onSend={handleRecordingSend}
        onCancel={() => setIsRecording(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="border-t border-border bg-background"
    >
      <View className="px-4 py-3 gap-2">
        {/* Attachment Options Row */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleAttachFile}
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.secondary}40` }}
          >
            <PaperclipIcon className="w-5 h-5" color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTakePhoto}
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.secondary}40` }}
          >
            <CameraIcon className="w-5 h-5" color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Text Input and Buttons */}
        <View className="flex-row items-center gap-2">
          {/* Text Input */}
          <TextInput
            value={messageText}
            onChangeText={(text) => {
              setMessageText(text);
              onTyping();
            }}
            placeholder="Message..."
            placeholderTextColor={colors['muted-foreground']}
            className="flex-1 px-3 py-2 rounded-lg text-foreground"
            style={{
              backgroundColor: `${colors.secondary}40`,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            multiline
            maxHeight={100}
          />

          {/* Send or Mic Button */}
          {messageText.trim().length > 0 ? (
            <TouchableOpacity
              onPress={handleSubmit}
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <SendIcon className="w-5 h-5" color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsRecording(true)}
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <MicIcon className="w-5 h-5" color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
