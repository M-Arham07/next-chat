import React, { useState, useRef } from "react";
import {
  View,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
  Pressable,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Message } from "@chat/shared";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { formatTime } from "@/lib/format-time";
import { getOriginalFilename } from "@/features/chat/lib/file-utils";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import MessageContextMenu from "./MessageContextMenu";

const MAX_SWIPE = 80;

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  isHighlighted: boolean;
  onReplyClick: (messageId: string) => void;
  onReply: (message: Message) => void;
  displayPic: { url?: string; show?: boolean };
  status: string;
}

// ── Inline content components ────────────────────────────────────

function TextContent({ content }: { content: string }) {
  return (
    <Text className="text-[15px] text-foreground leading-relaxed px-3.5 pt-2.5 pb-1">
      {content}
    </Text>
  );
}

function ImageContent({ uri, status }: { uri: string; status: string }) {
  return (
    <View className="overflow-hidden rounded-xl">
      <Image
        source={{ uri }}
        className="w-56 h-44"
        resizeMode="cover"
      />
      {status === "sending" && (
        <View className="absolute bottom-2 left-0 right-0 items-center">
          <Text className="text-xs text-white font-semibold bg-black/50 px-2 py-0.5 rounded-full">
            Uploading…
          </Text>
        </View>
      )}
    </View>
  );
}

function VoiceContent() {
  return (
    <View className="flex-row items-center gap-x-2 px-3.5 py-2.5">
      <Text className="text-2xl">🎤</Text>
      <Text className="text-sm text-foreground">Voice message</Text>
    </View>
  );
}

function VideoContent() {
  return (
    <View className="w-56 h-36 bg-secondary items-center justify-center gap-y-2 rounded-xl">
      <Text className="text-3xl">🎬</Text>
      <Text className="text-sm text-foreground">Video</Text>
    </View>
  );
}

function DocumentContent({ name }: { name: string }) {
  return (
    <View className="flex-row items-center gap-x-2 px-3.5 py-2.5 max-w-[240px]">
      <Text className="text-2xl">📄</Text>
      <Text className="text-sm text-foreground flex-1" numberOfLines={2}>{name}</Text>
    </View>
  );
}

function StatusTick({ status, isSent }: { status: string; isSent: boolean }) {
  if (!isSent) return null;
  if (status === "sending") return <Text className="text-[10px] text-muted-foreground">⏳</Text>;
  if (status === "failed")  return <Text className="text-[10px] text-destructive font-bold">!</Text>;
  return <Text className="text-[10px] text-primary">✓✓</Text>;
}

// ── Main component ────────────────────────────────────────────────

export default function MessageBubble({
  message,
  isSent,
  isHighlighted,
  onReplyClick,
  onReply,
  displayPic,
  status,
}: MessageBubbleProps) {
  const { messages, handleRetryMessage } = useChatApp();
  const [menuVisible, setMenuVisible] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const hasTriggered = useRef(false);

  const repliedToMsg =
    messages![message.threadId]?.find((m) => m.msgId === message.replyToMsgId) ?? null;

  // ── Swipe-to-reply ────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dy) < 20,
      onPanResponderGrant: () => { hasTriggered.current = false; },
      onPanResponderMove: (_, gs) => {
        const raw = isSent ? -gs.dx : gs.dx;
        if (raw > 0) {
          translateX.setValue(isSent ? -Math.min(raw, 120) : Math.min(raw, 120));
          if (raw >= MAX_SWIPE && !hasTriggered.current) {
            hasTriggered.current = true;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onReply(message);
          }
        }
      },
      onPanResponderRelease: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 180,
          friction: 20,
        }).start();
      },
    })
  ).current;

  // ── Deleted ───────────────────────────────────────────────────
  if (message.type === "deleted") {
    return (
      <View className={cn("flex-row px-4 py-1", isSent ? "justify-end" : "justify-start")}>
        <View className="flex-row items-center gap-x-2 px-4 py-2 bg-secondary rounded-2xl border border-border/40">
          <Text className="text-sm text-muted-foreground italic">🚫 Message deleted</Text>
          <Text className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    );
  }

  // ── Normal ────────────────────────────────────────────────────
  return (
    <>
      <Animated.View
        className={cn(
          "flex-row items-end px-3 py-0.5 gap-x-1.5",
          isSent ? "justify-end" : "justify-start"
        )}
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {/* Avatar slot (received side) */}
        {!isSent && displayPic.show && (
          <Avatar uri={displayPic.url} fallback={message.sender?.[0] ?? "?"} size={26} className="mb-1 bg-muted" />
        )}
        {!isSent && !displayPic.show && <View className="w-[26px]" />}

        {/* Bubble */}
        <Pressable
          onLongPress={() => setMenuVisible(true)}
          delayLongPress={400}
          className="max-w-[78%]"
        >
          <View
            className={cn(
              "rounded-2xl border border-border/30 overflow-hidden",
              isSent ? "bg-secondary rounded-br-sm" : "bg-card rounded-bl-sm",
              status === "failed" && "border-destructive/50",
              isHighlighted && "border-primary/60"
            )}
          >
            {/* Reply preview */}
            {repliedToMsg && (
              <TouchableOpacity
                onPress={() => onReplyClick(repliedToMsg.msgId)}
                activeOpacity={0.7}
                className="border-l-2 border-primary/60 mx-2 mt-2 px-2 py-1 bg-white/5 rounded"
              >
                <Text className="text-xs font-bold text-primary mb-0.5">
                  {repliedToMsg.sender === message.sender ? "You" : "Them"}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {repliedToMsg.content}
                </Text>
              </TouchableOpacity>
            )}

            {/* Content */}
            {message.type === "text"     && message.content && <TextContent content={message.content} />}
            {message.type === "image"    && message.content && <ImageContent uri={message.content} status={status} />}
            {message.type === "voice"    && message.content && <VoiceContent />}
            {message.type === "video"    && message.content && <VideoContent />}
            {message.type === "document" && message.content && (
              <DocumentContent name={getOriginalFilename(message.content)} />
            )}

            {/* Footer */}
            <View className={cn(
              "flex-row items-center justify-end gap-x-1 px-2.5 pb-1.5",
              message.type === "image" ? "absolute bottom-1 right-1 bg-black/50 rounded-full px-2 py-0.5" : "pt-0.5"
            )}>
              <Text className="text-[10px] text-muted-foreground">
                {formatTime(message.timestamp)}
              </Text>
              <StatusTick status={status} isSent={isSent} />
            </View>
          </View>

          {/* Retry */}
          {isSent && status === "failed" && (
            <TouchableOpacity
              onPress={() => handleRetryMessage(message)}
              className="self-end mt-1 mr-1 px-3 py-1 bg-destructive/10 border border-destructive/30 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-xs font-semibold text-destructive">Retry</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Animated.View>

      <MessageContextMenu
        message={message}
        isMe={isSent}
        visible={menuVisible}
        onReply={() => onReply(message)}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}
