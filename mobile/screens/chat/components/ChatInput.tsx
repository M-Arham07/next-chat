import React, { useState } from "react";
import { View, TouchableOpacity, Platform, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { MessageContentType } from "@chat/shared";
import type { MobileFilePayload } from "@/features/chat/hooks/message-operations/use-send-message";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (
    type: Omit<MessageContentType, "deleted">,
    content: string | MobileFilePayload
  ) => void;
  onTyping: () => void;
}

export default function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const [content, setContent] = useState("");
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSend("text", content.trim());
    setContent("");
  };

  const handleAttach = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType ?? "application/octet-stream";
    let type: Omit<MessageContentType, "deleted"> = "document";
    if (mime.startsWith("image/")) type = "image";
    else if (mime.startsWith("video/")) type = "video";
    else if (mime.startsWith("audio/")) type = "voice";
    onSend(type, { uri: asset.uri, name: asset.name, mimeType: mime, size: asset.size });
  };

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    onSend("image", {
      uri: asset.uri,
      name: asset.fileName ?? "photo.jpg",
      mimeType: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize,
    });
  };

  const hasSendContent = content.trim().length > 0;

  return (
    <View
      className="flex-row items-end px-2.5 pt-2.5 bg-background border-t border-border gap-x-2"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      {/* Emoji */}
      <TouchableOpacity
        className="w-10 h-10 items-center justify-center rounded-full bg-secondary"
        activeOpacity={0.7}
      >
        <Text className="text-xl">😊</Text>
      </TouchableOpacity>

      {/* Input pill */}
      <View className="flex-1 flex-row items-end bg-secondary rounded-3xl border border-border px-4 py-1.5 gap-x-1">
        <TextInput
          className="flex-1 text-[15px] text-foreground max-h-28 py-1.5"
          value={content}
          onChangeText={(t) => { setContent(t); onTyping(); }}
          placeholder="Message"
          placeholderTextColor="hsl(240 5% 64.9%)"
          multiline
          returnKeyType="default"
          style={{ padding: 0 }}
        />

        {/* Attachment + camera icons */}
        <View className={cn("flex-row items-center gap-x-0.5", Platform.OS === "ios" ? "pb-0" : "pb-1")}>
          <TouchableOpacity
            onPress={handleAttach}
            className="w-9 h-9 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-lg">📎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCamera}
            className="w-9 h-9 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-lg">📷</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Send / Mic */}
      <TouchableOpacity
        onPress={hasSendContent ? handleSubmit : undefined}
        className="w-11 h-11 rounded-full bg-primary items-center justify-center"
        activeOpacity={0.8}
      >
        <Text className="text-lg text-primary-foreground">
          {hasSendContent ? "➤" : "🎤"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
