import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useInfiniteMessages } from "@/features/chat/hooks/use-infinite-messages";
import { Message, participant } from "@chat/shared";
import type { MobileFilePayload } from "@/features/chat/hooks/message-operations/use-send-message";
import { Text } from "@/components/ui/text";
import ChatHeader from "@/screens/chat/components/ChatHeader";
import ChatInput from "@/screens/chat/components/ChatInput";
import MessageBubble from "@/screens/chat/components/MessageBubble";
import DateSeparator from "@/screens/chat/components/DateSeparator";
import TypingIndicator from "@/screens/chat/components/TypingIndicator";

function getDateLabel(iso: string): string {
  const msgDate = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(msgDate, today)) return "Today";
  if (sameDay(msgDate, yesterday)) return "Yesterday";
  return msgDate.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
    ...(msgDate.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}

type ListItem =
  | { kind: "separator"; key: string; date: string }
  | { kind: "message"; key: string; message: Message; idx: number };

export default function MessageScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const insets = useSafeAreaInsets();

  const {
    messages, replyingToMsg, handleSendMessage,
    handleTyping, set, stopTypingEmit,
    threads, typingUsers, mounted,
  } = useChatApp();
  const { profile } = useAuth()!;

  const flatListRef = useRef<FlatList>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const messageIndexMap = useRef<Record<string, number>>({});

  const { loadingState, fetchOlderMessages, retry } = useInfiniteMessages(threadId, mounted);

  const thisThread = threads?.find((t) => t.threadId === threadId);
  let otherParticipant: participant | undefined;
  if (thisThread?.type === "direct") {
    otherParticipant = thisThread.participants?.find(
      (p) => p.username.toLowerCase() !== profile?.username?.toLowerCase()
    );
  }

  const threadMessages = messages?.[threadId] ?? [];

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    messageIndexMap.current = {};
    threadMessages.forEach((msg, idx) => {
      const prev = threadMessages[idx - 1];
      const label = getDateLabel(msg.timestamp);
      if (!prev || getDateLabel(prev.timestamp) !== label) {
        items.push({ kind: "separator", key: `sep-${msg.msgId}`, date: label });
      }
      const flatIdx = items.length;
      items.push({ kind: "message", key: msg.msgId, message: msg, idx });
      messageIndexMap.current[msg.msgId] = flatIdx;
    });
    return items;
  }, [threadMessages]);

  const scrollToMessage = useCallback((msgId: string) => {
    const flatIdx = messageIndexMap.current[msgId];
    if (flatIdx != null) {
      flatListRef.current?.scrollToIndex({ index: flatIdx, animated: true, viewPosition: 0.5 });
      setHighlightedId(msgId);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  }, []);

  useEffect(() => {
    return () => {
      set("replyingToMsg", null);
      stopTypingEmit(threadId);
    };
  }, []);

  const handleSend = useCallback(
    (type: any, content: string | MobileFilePayload) => {
      handleSendMessage(threadId, type, content);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    },
    [threadId, handleSendMessage]
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === "separator") return <DateSeparator date={item.date} />;
    const { message, idx } = item;
    const prevMsg = threadMessages[idx - 1];
    return (
      <MessageBubble
        message={message}
        isSent={message.sender === profile?.id}
        isHighlighted={highlightedId === message.msgId}
        onReplyClick={scrollToMessage}
        onReply={(msg) => set("replyingToMsg", msg)}
        displayPic={{
          url: thisThread?.participants.find((p) => p.userId === message.sender)?.image,
          show: prevMsg?.sender !== message.sender,
        }}
        status={message.status ?? "sent"}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
        <ChatHeader
          username={otherParticipant?.username ?? thisThread?.groupName}
          image={otherParticipant?.image}
          status="online"
        />

        {loadingState !== "idle" && (
          <View className="flex-row items-center justify-center gap-x-2 py-2 bg-secondary">
            {loadingState === "loading" ? (
              <>
                <ActivityIndicator size="small" color="hsl(0 0% 98%)" />
                <Text className="text-sm text-foreground">Loading messages…</Text>
              </>
            ) : (
              <>
                <Text className="text-sm text-destructive">Failed to load</Text>
                <TouchableOpacity onPress={retry} activeOpacity={0.7}>
                  <Text className="text-sm text-destructive font-bold underline">Try again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={listData}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerClassName="py-2"
          onEndReached={fetchOlderMessages}
          onEndReachedThreshold={0.3}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onScrollToIndexFailed={() => {}}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {[...(typingUsers?.[threadId] ?? [])].map((uid) => {
                const user = thisThread?.participants.find((p) => p.userId === uid);
                return (
                  <TypingIndicator
                    key={uid}
                    isSent={uid === profile?.id}
                    displayPicUrl={user?.image}
                    username={user?.username}
                  />
                );
              })}
            </>
          }
        />

        {replyingToMsg && (
          <View className="flex-row items-center gap-x-3 px-4 py-2.5 bg-secondary border-t border-border">
            <View className="flex-1">
              <Text className="text-xs font-bold text-primary">
                Replying to {replyingToMsg.sender}
              </Text>
              <Text className="text-sm text-foreground" numberOfLines={1}>
                {replyingToMsg.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => set("replyingToMsg", null)} className="p-1.5" activeOpacity={0.7}>
              <Text className="text-base text-muted-foreground">✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <ChatInput onSend={handleSend} onTyping={() => handleTyping(threadId)} />
      </View>
    </KeyboardAvoidingView>
  );
}
