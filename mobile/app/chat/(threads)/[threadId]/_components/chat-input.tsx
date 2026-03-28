import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { View, TextInput, Pressable } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Smile, Paperclip, Camera, Mic, Send } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { MessageContentType } from "@shared/types";
import { VoiceRecorder } from "./voice-recorder";

interface ChatInputProps {
  onSend: (
    type: Omit<MessageContentType, "deleted">,
    content: string | File
  ) => Promise<void>;
  inputRef: React.RefObject<TextInput>;
}

export function ChatInput({ onSend, inputRef }: ChatInputProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSend("text", content);
      setContent("");
    }
  };

  const handleRecordingSend = (audioUri: string) => {
    onSend("voice", audioUri);
    setIsRecording(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // In a real app, you'd upload the file and pass the URL
      onSend("image", result.assets[0].uri);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSend("document", result.assets[0].uri);
      }
    } catch (err) {
      console.log("Document pick error:", err);
    }
  };

  if (isRecording) {
    return (
      <VoiceRecorder
        onSend={handleRecordingSend}
        onCancel={() => setIsRecording(false)}
      />
    );
  }

  return (
    <MotiView
      from={{ translateY: 20, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{ type: "timing", duration: 300 }}
      className="absolute bottom-0 left-0 right-0 px-3 pt-3 border-t"
      style={{
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <View className="flex-row items-center gap-2">
        {/* Emoji Button */}
        <Pressable className="p-2 rounded-full active:opacity-70">
          <Smile size={24} color={colors.mutedForeground} />
        </Pressable>

        {/* Input Field */}
        <View
          className="flex-1 flex-row items-center px-4 rounded-full"
          style={{ backgroundColor: colors.secondary }}
        >
          <TextInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            placeholder="Message"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={2000}
            className="flex-1 py-3 text-base max-h-24"
            style={{ color: colors.foreground }}
          />

          {/* Attachment Buttons */}
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={handlePickDocument}
              className="p-2 rounded-full active:opacity-70"
            >
              <Paperclip size={20} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={handlePickImage}
              className="p-2 rounded-full active:opacity-70"
            >
              <Camera size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        {/* Send / Mic Button */}
        <AnimatePresence exitBeforeEnter>
          {content.trim().length > 0 ? (
            <MotiView
              key="send"
              from={{ scale: 0, rotate: "-90deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              exit={{ scale: 0, rotate: "90deg" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Pressable
                onPress={handleSubmit}
                className="p-3 rounded-full active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Send size={20} color={colors.primaryForeground} />
              </Pressable>
            </MotiView>
          ) : (
            <MotiView
              key="mic"
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsRecording(true);
                }}
                className="p-3 rounded-full active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Mic size={20} color={colors.primaryForeground} />
              </Pressable>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </MotiView>
  );
}
