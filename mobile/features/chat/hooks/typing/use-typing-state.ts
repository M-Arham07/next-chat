import { useRef, RefObject } from 'react';
import { type SocketClientType } from '@/features/chat/lib/socket-client';
import { Profile } from '@chat/shared/schema/profiles/profile';

interface UseTypingStateParams {
  profile: Profile | null;
  socketRef: RefObject<SocketClientType | null>;
}

export const useTypingState = ({ profile, socketRef }: UseTypingStateParams) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTypingEmit = (threadId: string) => {
    socketRef.current?.emit('typing:stop', threadId, profile?.id || '');
  };

  const handleTyping = (threadId: string) => {
    // Edge case
    if (!threadId || !profile?.id) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      console.log('TYPING START');

      // Emit start event
      socketRef.current?.emit('typing:start', threadId, profile.id);
    }

    // Stop (debounced)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
      console.log('TYPING STOP');

      stopTypingEmit(threadId);
    }, 800);
  };

  return {
    handleTyping,
    stopTypingEmit,
  };
};
