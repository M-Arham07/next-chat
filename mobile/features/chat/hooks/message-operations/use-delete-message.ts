import { RefObject } from 'react';
import { Message, MessageStatusType } from '@chat/shared';
import { type SocketClientType } from '@/features/chat/lib/socket-client';
import { Profile } from '@chat/shared/schema/profiles/profile';

interface UseDeleteMessageParams {
  profileRef: RefObject<Profile | null>;
  socketRef: RefObject<SocketClientType | null>;
  updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void;
  removeMessage: (threadId: string, msgId: string) => void;
}

export const useDeleteMessage = ({
  profileRef,
  socketRef,
  updateMessageStatus,
  removeMessage,
}: UseDeleteMessageParams) => {
  const handleDeleteMessage = async (messageToDelete: Message): Promise<void> => {
    const { threadId, msgId, sender } = messageToDelete;

    // Only allow deletion of own messages
    if (sender !== profileRef.current?.id) return;

    // Set status to sending to show loading
    updateMessageStatus(threadId, msgId, 'sending');

    socketRef.current?.emit('message:delete', messageToDelete, (res: { ok: boolean }) => {
      if (!res.ok) {
        console.error('Failed to delete message');

        // Restore original state if failed
        updateMessageStatus(threadId, msgId, 'sent');
        return;
      }

      // Remove message from state if successful
      removeMessage(threadId, msgId);
    });
  };

  return { handleDeleteMessage };
};
