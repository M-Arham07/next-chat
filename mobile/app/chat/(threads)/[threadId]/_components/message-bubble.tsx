import { useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { Check, CheckCheck, RotateCcw } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useAuth } from "@/providers/AuthProvider";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { Message } from "@shared/types";
import { formatTime } from "@/lib/format-time";
import { TextMessage } from "./text-message";
import { ImageMessage } from "./image-message";
import { VoiceMessage } from "./voice-message";
import { DocumentMessage } from "./document-message";

const MAX_SWIPE_THRESHOLD = 80;

interface MessageBubbleProps {
  message: Message;
  isHighlighted: boolean;
  onReplyClick: (messageId: string) => void;
  onReply: () => void;
  status: string;
}

export function MessageBubble({
  message,
  isHighlighted,
  onReplyClick,
  onReply,
  status = "sent",
}: MessageBubbleProps) {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { messages, handleSendMessage } = useChatApp();
  const translateX = useSharedValue(0);
  const hasTriggeredReply = useRef(false);

  const isSent = user?.email === message.sender || message.sender === "me";
  const isRead = true; // Placeholder

  // Get replied message
  const repliedToMsg = messages?.[message.threadId]?.find(
    (m) => m.msgId === message.replyToMsgId
  );

  const triggerReply = () => {
    if (!hasTriggeredReply.current) {
      hasTriggeredReply.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onReply();
    }
  };

  const resetSwipe = () => {
    hasTriggeredReply.current = false;
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      const direction = isSent ? -1 : 1;
      const clampedTranslation = Math.max(
        0,
        Math.min(event.translationX * direction, 150)
      );
      translateX.value = clampedTranslation * direction;

      if (Math.abs(clampedTranslation) >= MAX_SWIPE_THRESHOLD) {
        runOnJS(triggerReply)();
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      runOnJS(resetSwipe)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const getStatusStyles = () => {
    if (!isSent) return {};
    if (status === "sending") return { opacity: 0.5 };
    if (status === "failed") return { borderColor: colors.destructive, borderWidth: 1 };
    return {};
  };

  // Deleted message
  if (message.type === "deleted") {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`flex-row px-4 py-1 ${isSent ? "justify-end" : "justify-start"}`}
      >
        <View
          className="flex-row items-center gap-2 px-4 py-2 rounded-2xl"
          style={{
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-sm italic"
            style={{ color: colors.mutedForeground }}
          >
            Message deleted
          </Text>
          <Text className="text-xs" style={{ color: colors.mutedForeground }}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </MotiView>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          animatedStyle,
          {
            flexDirection: "row",
            justifyContent: isSent ? "flex-end" : "flex-start",
            paddingHorizontal: 16,
            paddingVertical: 4,
          },
        ]}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="max-w-[80%] rounded-2xl overflow-hidden"
          style={[
            {
              backgroundColor: isSent ? colors.secondary : colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderBottomRightRadius: isSent ? 4 : 16,
              borderBottomLeftRadius: isSent ? 16 : 4,
            },
            getStatusStyles(),
            isHighlighted && {
              backgroundColor: colors.primary + "30",
            },
          ]}
        >
          {/* Reply Preview */}
          {repliedToMsg && (
            <Pressable
              onPress={() => onReplyClick(repliedToMsg.msgId)}
              className="px-3 pt-2 pb-1 mx-2 mt-2 rounded"
              style={{
                backgroundColor: colors.background,
                borderLeftWidth: 2,
                borderLeftColor: colors.primary,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: colors.primary }}
              >
                {repliedToMsg.sender === user?.email ? "You" : repliedToMsg.sender}
              </Text>
              <Text
                className="text-xs"
                numberOfLines={1}
                style={{ color: colors.mutedForeground }}
              >
                {repliedToMsg.content}
              </Text>
            </Pressable>
          )}

          {/* Message Content */}
          {message.type === "text" && <TextMessage content={message.content} />}
          {message.type === "image" && <ImageMessage imageUrl={message.content} />}
          {message.type === "voice" && <VoiceMessage voiceUrl={message.content} />}
          {message.type === "document" && (
            <DocumentMessage documentName="Document" documentUrl={message.content} />
          )}

          {/* Timestamp & Status */}
          <View
            className={`flex-row items-center justify-end gap-1 px-3 pb-2 ${
              message.type === "image" ? "absolute bottom-1 right-1 bg-black/50 rounded-full px-2 py-1" : ""
            }`}
          >
            <Text className="text-[10px]" style={{ color: colors.mutedForeground }}>
              {formatTime(message.timestamp)}
            </Text>
            {isSent && (
              <>
                {status === "sending" && (
                  <View
                    className="w-3 h-3 rounded-full border-2 animate-spin"
                    style={{ borderColor: colors.mutedForeground, borderTopColor: colors.primary }}
                  />
                )}
                {status === "failed" && (
                  <Text className="text-xs font-bold" style={{ color: colors.destructive }}>
                    !
                  </Text>
                )}
                {status === "sent" &&
                  (isRead ? (
                    <CheckCheck size={14} color={colors.primary} />
                  ) : (
                    <Check size={14} color={colors.mutedForeground} />
                  ))}
              </>
            )}
          </View>
        </MotiView>

        {/* Retry Button */}
        {isSent && status === "failed" && (
          <Pressable
            onPress={() => handleSendMessage(message.type, message.content)}
            className="ml-2 px-3 py-1 rounded self-center"
            style={{ backgroundColor: colors.destructive + "20" }}
          >
            <RotateCcw size={14} color={colors.destructive} />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
