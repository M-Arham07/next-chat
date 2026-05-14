import { useRef, RefObject } from "react";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";

interface UseTypingStateParams {
    profile: Profile | null;
    socketRef: RefObject<SocketClientType | null>;
}

export const useTypingState = ({ profile, socketRef }: UseTypingStateParams) => {
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const stopTypingEmit = (threadId: string) => {
        if (!profile?.id) return;
        void socketRef.current?.publishTypingStop(threadId, profile.id);
    }

    const handleTyping = (threadId: string) => {
        // edge case:
        if (!threadId || !profile?.id) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            void socketRef.current?.publishTypingStart(threadId, profile.id);
        }

        // STOP (debounced)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            typingTimeoutRef.current = null;
            stopTypingEmit(threadId);
        }, 800);
    }

    return {
        handleTyping,
        stopTypingEmit,
    };
};
