import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useMemo, useCallback } from 'react';
import { useChatApp } from '@/features/chat/hooks/use-chat-app';
import { useInfiniteScroll } from '@/features/chat/hooks/use-infinite-scroll';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Message } from '@chat/shared';
import { MessageBubble } from '../_components/message-bubble';
import { ChatInput } from '../_components/chat-input';

/**
 * Thread/Message View Screen
 * Displays messages for a specific thread
 * Main chat interface for messaging
 */
export default function ThreadScreen() {
  const router = useRouter();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { profile } = useAuth();
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const sentinelRef = useRef<View | null>(null);
  const mainRef = useRef<View | null>(null);

  const {
    threads,
    messages,
    typingUsers,
    uploadingProgress,
    handleSendMessage,
    handleDeleteMessage,
    handleRetryMessage,
    handleTyping,
    stopTypingEmit,
  } = useChatApp();

  if (!threadId) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Thread not found</Text>
      </View>
    );
  }

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId]
  );

  const threadMessages = useMemo(
    () => messages[threadId] || [],
    [messages, threadId]
  );

  useInfiniteScroll({
    threadId,
    sentinelRef,
    mainRef,
    mounted: !!threadId,
    setLoadingState,
  });

  const typingUsersList = useMemo(
    () => typingUsers?.[threadId] || [],
    [typingUsers, threadId]
  );

  const renderMessageItem = useCallback(
    ({ item }: { item: Message }) => {
      const isOwnMessage = item.sender === profile?.username;
      const uploadProgress = uploadingProgress?.[item.msgId] || 0;

      return (
        <MessageBubble
          message={item}
          isSent={isOwnMessage}
          uploadProgress={uploadProgress}
          displayPic={{
            url: !isOwnMessage ? profile?.avatar_url : undefined,
            show: !isOwnMessage,
          }}
          onReply={() => setReplyingTo(item)}
          onDelete={() => handleDeleteMessage(item)}
          onRetry={() => handleRetryMessage(item)}
        />
      );
    },
    [profile?.username, profile?.avatar_url, uploadingProgress, handleDeleteMessage, handleRetryMessage]
  );

  const handleSendWithType = useCallback(
    async (
      type: 'text' | 'image' | 'video' | 'voice' | 'document',
      content: string | unknown
    ) => {
      if (!threadId) return;

      try {
        await handleSendMessage(threadId, type, content);
        stopTypingEmit(threadId);
        setReplyingTo(null);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [threadId, handleSendMessage, stopTypingEmit]
  );

  const handleTypingEvent = useCallback(() => {
    if (threadId) {
      handleTyping(threadId);
    }
  }, [threadId, handleTyping]);

  const renderTypingIndicator = useCallback(() => {
    if (typingUsersList.length === 0) return null;

    return (
      <View className="px-4 py-2">
        <Text className="text-xs text-muted-foreground">
          {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing...
        </Text>
      </View>
    );
  }, [typingUsersList]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary text-lg">←</Text>
        </TouchableOpacity>

        <View>
          <Text className="font-semibold text-foreground">
            {thread?.name || 'Thread'}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {thread?.participants?.length || 0} members
          </Text>
        </View>
      </View>

      <View ref={mainRef} className="flex-1">
        {threadMessages.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">No messages yet</Text>
          </View>
        ) : (
          <FlatList
            data={threadMessages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.msgId}
            inverted
            scrollEnabled
          />
        )}

        <View ref={sentinelRef} className="h-10" />

        {loadingState === 'loading' && (
          <View className="items-center py-2">
            <ActivityIndicator />
          </View>
        )}
      </View>

      {renderTypingIndicator()}

      {replyingTo && (
        <View className="px-4 py-2 border-t border-border">
          <Text className="text-xs text-muted-foreground">
            Replying to {replyingTo.sender}
          </Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Text className="text-primary text-xs mt-1">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <ChatInput
        onSend={handleSendWithType}
        onTyping={handleTypingEvent}
      />
    </View>
  );
}
