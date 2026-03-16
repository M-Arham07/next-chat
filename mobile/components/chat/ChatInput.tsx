import React, { useState, useRef } from "react";
import { View, TextInput, Pressable, Platform, KeyboardAvoidingView } from "react-native";
import { Camera, Image as ImageIcon, Paperclip, Mic, Send, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export function ChatInput({ onSendMessage, replyingTo, onCancelReply, onMicPress }: any) {
  const [content, setContent] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(content, "text");
    setContent("");
  };

  const pickMedia = async (type: 'image' | 'video') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      onSendMessage("", type, {
        uri: asset.uri,
        name: asset.fileName || `${type}_${Date.now()}.jpg`,
        type: asset.mimeType || (type === "video" ? "video/mp4" : "image/jpeg"),
      });
    }
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      onSendMessage("", "document", {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      className="bg-background/80 border-t border-border/40 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-3xl"
    >
      <View className="flex-row items-end gap-2 px-3 py-3">
        {/* Attachment Options */}
        <View className="flex-row items-center gap-1 shrink-0 pb-1">
          <Pressable onPress={() => pickMedia('image')} className="h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50">
            <ImageIcon size={22} color="#a6a6a6" />
          </Pressable>
          <Pressable onPress={pickDocument} className="h-10 w-10 items-center justify-center rounded-full hover:bg-secondary/50 hidden md:flex">
            <Paperclip size={22} color="#a6a6a6" />
          </Pressable>
        </View>

        {/* Input Area */}
        <View className="flex-1 bg-secondary/40 border border-border/60 rounded-3xl pt-2 pb-2 px-4 justify-center relative min-h-[44px] max-h-[120px]">
          <TextInput
            ref={inputRef}
            placeholder="Message..."
            placeholderTextColor="#a6a6a6"
            multiline
            value={content}
            onChangeText={setContent}
            className="text-foreground text-[16px] leading-[20px] pb-1 pt-1"
            style={{ maxHeight: 100 }}
          />
        </View>

        {/* Send or Mic */}
        <View className="shrink-0 pb-1">
          {content.trim() ? (
            <Pressable 
              onPress={handleSend}
              className="h-10 w-10 items-center justify-center rounded-full bg-foreground"
            >
              <Send size={18} color="#1a1a1a" className="-ml-0.5 mt-0.5" />
            </Pressable>
          ) : (
            <Pressable 
              onPress={onMicPress}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary"
            >
              <Mic size={22} color="#f5f5f5" />
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
