import { RefObject, useRef } from 'react';
import { Message, MessageContentType, MessageStatusType, getEnvironmentName } from '@chat/shared';
import { type SocketClientType } from '@/features/chat/lib/socket-client';
import { getFileUrl } from '@/features/chat/lib/upload-utils';
import { messageSchema } from '@chat/shared/schema';
import { MAX_FILE_SIZE, MAX_OPTIMIZABLE_IMAGE_SIZE, MAX_VIDEO_SIZE_FOR_BROWSER } from '@chat/shared/constants';
import { Profile } from '@chat/shared/schema/profiles/profile';
import type { ChatAppStore } from '../../store/chatapp.store';

interface UseSendMessageParams {
  profileRef: RefObject<Profile | null>;
  socketRef: RefObject<SocketClientType | null>;
  replyingToMsg: Message | null;
  set: (key: keyof ChatAppStore, value: any) => void;
  addMessages: (msgs: Message[]) => void;
  updateMessageContent: (threadId: string, msgId: string, content: string) => void;
  updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void;
  setUploadingProgress: (msgId: string, percent: number) => void;
}

export const useSendMessage = ({
  profileRef,
  socketRef,
  replyingToMsg,
  set,
  addMessages,
  updateMessageContent,
  updateMessageStatus,
  setUploadingProgress,
}: UseSendMessageParams) => {
  const reconstructedFilesRef = useRef<Map<string, File>>(new Map());

  const handleSendMessage = async (
    threadId: string,
    type: Omit<MessageContentType, 'deleted'>,
    content: string | File
  ): Promise<void> => {
    console.log('handleSendMessage called for type:', type);

    // Reconstruct file from blob URL if needed
    let finalContent = content;

    if (type !== 'text' && typeof content === 'string' && content.startsWith('blob:')) {
      const cached = reconstructedFilesRef.current.get(content);
      if (cached) {
        finalContent = cached;
        reconstructedFilesRef.current.delete(content);
      } else {
        console.error('Could not reconstruct file from blob URL');
        return;
      }
    }

    // Determine file size limit based on type
    let currentLimit = MAX_FILE_SIZE;

    if (type === 'video') {
      currentLimit = MAX_VIDEO_SIZE_FOR_BROWSER;
    }

    // Create blob URL for preview (if file)
    let blobUrl: string | null = null;

    if (type !== 'text' && finalContent instanceof File) {
      blobUrl = URL.createObjectURL(finalContent);

      // Check file size
      if (finalContent.size > currentLimit) {
        if (type === 'video') {
          console.error(
            `Video size exceeds limit of ${currentLimit / (1024 * 1024)}MB. Please use the mobile app for larger files.`
          );
        } else {
          console.error(`File size exceeds limit of ${currentLimit / (1024 * 1024)}MB`);
        }
        URL.revokeObjectURL(blobUrl);
        return;
      }
    }

    // Create new message for state
    const newMessage: Message = {
      msgId:
        typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
          ? crypto.randomUUID?.() || `${Date.now()}`
          : (Date.now() - Math.random()).toString(),
      threadId,
      sender: profileRef.current?.id || '',
      type: type as MessageContentType,
      content: blobUrl || (finalContent as string),
      timestamp: new Date().toISOString(),
      replyToMsgId: replyingToMsg?.msgId,
      status: 'sending',
    };

    // Validate message with Zod schema
    if (!messageSchema.safeParse(newMessage).success) {
      console.error('Failed to validate message');
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return;
    }

    // Add message to state
    addMessages([newMessage]);
    set('replyingToMsg', null);

    let uploadedContentUrl: string | null = null;

    // Upload file if not text
    if (type !== 'text' && finalContent instanceof File) {
      try {
        const { url } = await getFileUrl(finalContent, (percent) => {
          setUploadingProgress(newMessage.msgId, percent);
        });

        uploadedContentUrl = url;

        // Update message content with real URL
        updateMessageContent(newMessage.threadId, newMessage.msgId, uploadedContentUrl);
        newMessage.content = uploadedContentUrl;

        // Clean up blob URL
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Error during file upload', err);
        updateMessageStatus(newMessage.threadId, newMessage.msgId, 'failed');
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        return;
      }
    }

    // Send message via socket
    socketRef.current?.emit('message:new', newMessage, (res: { ok: boolean }) => {
      if (!res.ok) {
        console.error('Failed to send message via socket');
        updateMessageStatus(newMessage.threadId, newMessage.msgId, 'failed');
        return;
      }

      // Mark as sent
      updateMessageStatus(newMessage.threadId, newMessage.msgId, 'sent');
    });
  };

  return { handleSendMessage };
};
