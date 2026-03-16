import React, { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Message } from "@chat/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/format-time";
import { Check, CheckCheck, Reply } from "lucide-react-native";
import { TextMessage } from "./TextMessage";
import { ImageMessage } from "./ImageMessage";
import { VideoMessage } from "./VideoMessage";
import { VoiceMessage } from "./VoiceMessage";
import { DocumentMessage } from "./DocumentMessage";
import { getOriginalFilename } from "@/features/chat/lib/file-utils";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  participant?: any;
  showAvatar?: boolean;
  onReply: () => void;
  onContextMenu: (x: number, y: number) => void;
}

export function MessageBubble({
  message,
  isMe,
  participant,
  showAvatar = true,
  onReply,
  onContextMenu,
}: MessageBubbleProps) {
  const isDeleted = message.type === "deleted";

  // Web's swipe-to-reply translates perfectly to Swipeable from react-native-gesture-handler
  const renderRightActions = (progress: any, dragX: any) => {
    return (
      <View className="justify-center items-center w-16 h-full px-2">
        <View className="bg-secondary/80 rounded-full p-2 h-10 w-10 items-center justify-center">
          <Reply size={20} color="#f5f5f5" />
        </View>
      </View>
    );
  };

  const handleSwipeableOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReply();
  };

  const statusIcon =
    message.status === "sending" ? (
      <Check size={14} color="#737373" />
    ) : (
      <CheckCheck size={14} color={message.readBy ? "#3b82f6" : "#737373"} />
    );

  const bubbleClasses = [
    "relative max-w-[85%] rounded-2xl",
    isMe ? "bg-accent/80 ml-auto border border-glass-border/40" : "bg-secondary/40 mr-auto border border-border/40",
    isMe && showAvatar ? "rounded-br-sm" : "",
    !isMe && showAvatar ? "rounded-bl-sm" : "",
  ].join(" ");

  return (
    <Swipeable 
      renderRightActions={isMe ? renderRightActions : undefined}
      renderLeftActions={!isMe ? renderRightActions : undefined}
      onSwipeableOpen={handleSwipeableOpen}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      <View className={`group flex-row items-end gap-2 mb-2 px-4 ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <View className="w-8 shrink-0 pb-1">
            {showAvatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={participant?.image} />
                <AvatarFallback>{participant?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            ) : (
              <View className="h-8 w-8" />
            )}
          </View>
        )}

        <Pressable 
          onLongPress={(e: any) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // approximate Native pos
            onContextMenu(e.nativeEvent.pageX, e.nativeEvent.pageY);
          }}
          className={bubbleClasses}
        >
          {isDeleted ? (
            <Text className="px-4 py-2 italic text-muted-foreground text-sm">
              This message was deleted
            </Text>
          ) : (
            <View>
              {message.type === "text" && <TextMessage content={message.content} />}
              {message.type === "image" && <ImageMessage msgId={message.msgId} imageUrl={message.content} status={message.status} />}
              {message.type === "video" && <VideoMessage msgId={message.msgId} videoUrl={message.content} status={message.status} />}
              {message.type === "voice" && <VoiceMessage msgId={message.msgId} voiceUrl={message.content} status={message.status} />}
              {message.type === "document" && (
                <DocumentMessage 
                  msgId={message.msgId} 
                  documentName={getOriginalFilename(message.content)} 
                  documentUrl={message.content} 
                  status={message.status} 
                />
              )}
            </View>
          )}

          <View className={`flex-row items-center justify-end gap-1 px-3 pb-2 pt-1 ${message.type === "image" || message.type === "video" ? 'absolute bottom-1 right-1 bg-black/40 rounded-lg px-2 py-0.5' : ''}`}>
             <Text className={`text-[10px] ${message.type === "image" || message.type === "video" ? 'text-white/90' : 'text-muted-foreground'}`}>
               {formatTime(message.timestamp)}
             </Text>
             {isMe && statusIcon}
          </View>
        </Pressable>
      </View>
    </Swipeable>
  );
}
