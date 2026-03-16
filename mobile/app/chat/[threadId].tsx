import React, { useRef, useState, useEffect } from "react";
import { View, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Message } from "@chat/shared";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

export default function ChatThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { threads, messages } = useChatAppStore();
  const { handleSendMessage } = useChatApp()!;
  
  const mockSession = { user: { username: "m_arham07" } };
  const currentUsername = mockSession.user.username;

  const thread = threads?.find(t => t.threadId === threadId);
  const threadMessages = messages?.[threadId] || [];

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom nicely when new messages arrive.
  // In a real app we invert the FlatList, meaning idx 0 is the bottom, which is standard for chat.
  // Since the web store doesn't invert necessarily, we'll keep the standard list but scroll to end.
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages.length]);

  const onSendMessage = async (
    content: string, 
    type: Message["type"], 
    file?: any
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await handleSendMessage(threadId, content, type, replyingTo?.msgId, file);
    setReplyingTo(null);
    scrollToBottom();
  };

  const activeTypingUsers = new Set<string>(); // Mocking. Pull from store if needed.

  return (
    <View className="flex-1 bg-background relative pt-4 pb-0">
      <ChatHeader 
        thread={thread} 
        currentUsername={currentUsername} 
        typingUsers={activeTypingUsers} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          className="flex-1 px-2 pt-4"
          data={threadMessages}
          keyExtractor={(msg) => msg.msgId}
          renderItem={({ item, index }) => {
            const isMe = item.sender === currentUsername;
            const participant = thread?.particpants.find(p => p.username === item.sender);
            
            // show avatar if the next message is from a DIFFERENT sender or if it's the last message
            const showAvatar = index === threadMessages.length - 1 || threadMessages[index + 1]?.sender !== item.sender;

            return (
              <MessageBubble
                message={item}
                isMe={isMe}
                participant={participant}
                showAvatar={showAvatar}
                onReply={() => setReplyingTo(item)}
                onContextMenu={(x, y) => {
                  console.log("Context menu at", x, y);
                  // ActionSheet or custom modal goes here.
                }}
              />
            );
          }}
          onLayout={scrollToBottom}
        />

        <ChatInput 
          onSendMessage={onSendMessage}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onMicPress={() => console.log("Start recording dictation/voice msg")}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
