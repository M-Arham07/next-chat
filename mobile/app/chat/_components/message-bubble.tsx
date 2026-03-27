import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useUniwind } from 'uniwind';
import { useState } from 'react';
import { Message } from '@chat/shared';
import { Text } from '@/components/ui/text';
import { formatTime } from '@/lib/format-time';

import { TextMessageBubble } from './message-bubbles/text-message-bubble';
import { ImageMessageBubble } from './message-bubbles/image-message-bubble';
import { VideoMessageBubble } from './message-bubbles/video-message-bubble';
import { VoiceMessageBubble } from './message-bubbles/voice-message-bubble';
import { DocumentMessageBubble } from './message-bubbles/document-message-bubble';
import { CheckIcon, CheckCheckIcon } from '@/components/ui/icon';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  displayPic?: { url?: string; show?: boolean };
  uploadProgress?: number;
  onReply?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onRetry?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isSent,
  displayPic,
  uploadProgress = 0,
  onReply,
  onDelete,
  onRetry,
}: MessageBubbleProps) {
  const { colors } = useUniwind();
  const [isPressed, setIsPressed] = useState(false);

  if (message.type === 'deleted') {
    return (
      <View
        className={`px-4 py-2 ${isSent ? 'items-end' : 'items-start'} flex-row gap-2`}
      >
        {!isSent && displayPic?.show && (
          <Image
            source={{ uri: displayPic.url }}
            className="w-8 h-8 rounded-full"
          />
        )}
        <View
          className="px-4 py-2 rounded-2xl flex-row items-center gap-2"
          style={{ backgroundColor: `${colors.secondary}40` }}
        >
          <View
            className="w-4 h-4 rounded-full border-2 items-center justify-center"
            style={{ borderColor: colors.muted }}
          >
            <View
              className="w-2 h-0.5"
              style={{
                backgroundColor: colors.muted,
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>
          <Text className="text-sm text-muted-foreground italic">
            Message deleted
          </Text>
          <Text className="text-xs text-muted-foreground ml-2">
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  const getStatusIcon = () => {
    if (!isSent) return null;

    if (message.status === 'sending') {
      return <ActivityIndicator color={colors.primary} size="small" />;
    } else if (message.status === 'failed') {
      return <Text className="text-xs font-bold text-red-500">!</Text>;
    } else {
      return (
        <CheckCheckIcon
          className="w-4 h-4"
          color={colors.primary}
          fill={colors.primary}
        />
      );
    }
  };

  return (
    <TouchableOpacity
      onLongPress={() => setIsPressed(true)}
      onContextMenu={() => setIsPressed(true)}
      activeOpacity={0.7}
    >
      {/* Message Context Menu on Long Press */}
      {isPressed && (
        <View className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg z-50">
          {onReply && (
            <TouchableOpacity
              onPress={() => {
                onReply(message);
                setIsPressed(false);
              }}
              className="px-4 py-2 border-b border-border"
            >
              <Text className="text-sm text-foreground">Reply</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => {
                onDelete(message);
                setIsPressed(false);
              }}
              className="px-4 py-2 border-b border-border"
            >
              <Text className="text-sm text-red-500">Delete</Text>
            </TouchableOpacity>
          )}
          {message.status === 'failed' && onRetry && (
            <TouchableOpacity
              onPress={() => {
                onRetry(message);
                setIsPressed(false);
              }}
              className="px-4 py-2"
            >
              <Text className="text-sm text-orange-500">Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Message Bubble Container */}
      <View
        className={`px-4 py-2 flex-row gap-2 ${
          isSent ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Avatar for received messages */}
        {!isSent && displayPic?.show && (
          <Image
            source={{ uri: displayPic.url }}
            className="w-8 h-8 rounded-full mt-auto"
          />
        )}

        {/* Main Bubble */}
        <View
          className={`rounded-2xl overflow-hidden max-w-xs ${
            isSent
              ? 'rounded-br-none'
              : 'rounded-bl-none'
          }`}
          style={{
            backgroundColor: isSent
              ? colors.primary
              : `${colors.muted}40`,
            borderWidth: 1,
            borderColor: `${colors.border}40`,
            opacity:
              message.status === 'sending' ? 0.6 : 1,
            borderColor:
              message.status === 'failed'
                ? colors.destructive
                : `${colors.border}40`,
          }}
        >
          {/* Content based on message type */}
          {message.type === 'text' && (
            <TextMessageBubble content={message.content} />
          )}
          {message.type === 'image' && (
            <ImageMessageBubble
              msgId={message.msgId}
              imageUrl={message.content}
              status={message.status}
              uploadProgress={uploadProgress}
            />
          )}
          {message.type === 'video' && (
            <VideoMessageBubble
              msgId={message.msgId}
              videoUrl={message.content}
              status={message.status}
              uploadProgress={uploadProgress}
            />
          )}
          {message.type === 'voice' && (
            <VoiceMessageBubble
              msgId={message.msgId}
              voiceUrl={message.content}
              status={message.status}
              uploadProgress={uploadProgress}
            />
          )}
          {message.type === 'document' && (
            <DocumentMessageBubble
              msgId={message.msgId}
              documentName={message.content.split('/').pop() || 'Document'}
              documentUrl={message.content}
              status={message.status}
              uploadProgress={uploadProgress}
            />
          )}

          {/* Timestamp and Status */}
          <View className="flex-row items-center justify-end gap-1 px-3 pb-2">
            <Text className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </Text>
            {getStatusIcon()}
          </View>
        </View>
      </View>

      {/* Retry Button for Failed Messages */}
      {message.status === 'failed' && onRetry && (
        <TouchableOpacity
          onPress={() => onRetry(message)}
          className="px-3 py-1 ml-auto mr-4 mt-1 rounded bg-red-500/10 border border-red-500/30"
        >
          <Text className="text-xs font-medium text-red-500">Retry</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
