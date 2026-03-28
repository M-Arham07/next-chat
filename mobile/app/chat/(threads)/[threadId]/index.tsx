import { useState, useEffect, useRef } from "react";
import { View, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { Message } from "@shared/types";
import { ChatHeader } from "./_components/chat-header";
import { ChatInput } from "./_components/chat-input";
import { MessageBubble } from "./_components/message-bubble";
import { DateSeparator } from "./_components/date-separator";
import { ReplyPreview } from "./_components/reply-preview";

export default function ChatsView() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<any>(null);

  const { messages, replyingToMsg, handleSendMessage, set } = useChatApp();

  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set selected thread ID on mount
  useEffect(() => {
    if (threadId) {
      set("selectedThreadId", threadId);
    }

    return () => {
      set("selectedThreadId", undefined);
      set("replyingToMsg", null);
    };
  }, [threadId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (mounted && messages?.[threadId]?.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.[threadId]?.length, mounted]);

  const handleReplyPreviewClick = (messageId: string) => {
    // Find message index and scroll to it
    const messageIndex = messages?.[threadId]?.findIndex(
      (m) => m.msgId === messageId
    );
    if (messageIndex !== undefined && messageIndex >= 0) {
      flatListRef.current?.scrollToIndex({
        index: messageIndex,
        animated: true,
        viewPosition: 0.5,
      });

      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  const handleReply = (message: Message) => {
    set("replyingToMsg", message);
    inputRef.current?.focus();
  };

  if (!mounted) {
    return null;
  }

  const threadMessages = messages?.[threadId] || [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1">
          <ChatHeader name="+92 332 6910247" status="online" avatarInitial="W" />

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={{ flex: 1 }}
          >
            <FlatList
              ref={flatListRef}
              data={threadMessages}
              keyExtractor={(item) => item.msgId}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isHighlighted={highlightedMessageId === item.msgId}
                  onReplyClick={handleReplyPreviewClick}
                  onReply={() => handleReply(item)}
                  status={item.status}
                />
              )}
              ListHeaderComponent={<DateSeparator date="Today" />}
              contentContainerStyle={{
                paddingBottom: replyingToMsg ? 140 : 100,
                paddingTop: 10,
              }}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                }, 100);
              }}
            />
          </MotiView>

          {/* Reply Preview */}
          <AnimatePresence>
            {replyingToMsg && (
              <ReplyPreview
                message={replyingToMsg}
                onClose={() => set("replyingToMsg", null)}
              />
            )}
          </AnimatePresence>

          <ChatInput onSend={handleSendMessage} inputRef={inputRef} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
