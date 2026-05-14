import { RefObject, useEffect, useRef } from "react";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
import { Message } from "@chat/shared";
import { Profile } from "@chat/shared/schema/profiles/profile";

interface SocketListenersParams {
    socketRef: RefObject<SocketClientType | null>;
    profileRef: RefObject<Profile | null>;
    onMessageReceived: (msg: Message) => void;
    onMessageDeleted: (threadId: string, msgId: string) => void;
    onTypingStart: (threadId: string, id: string) => void;
    onTypingStop: (threadId: string, id: string) => void;
}

export const useSocketListeners = ({
    socketRef,
    profileRef,
    onMessageReceived,
    onMessageDeleted,
    onTypingStart,
    onTypingStop,
}: SocketListenersParams) => {
    useEffect(() => {
        if (!socketRef.current) return;

        const handleTypingStart = (threadId: string, id: string) => {
            if (profileRef.current?.id !== id) {
                onTypingStart(threadId, id);
            }
        };

        socketRef.current.onMessageReceived(onMessageReceived);
        socketRef.current.onMessageDeleted(onMessageDeleted);
        socketRef.current.onTypingStart(handleTypingStart);
        socketRef.current.onTypingStop(onTypingStop);

        return () => {
            socketRef.current?.offMessageReceived(onMessageReceived);
            socketRef.current?.offMessageDeleted(onMessageDeleted);
            socketRef.current?.offTypingStart(handleTypingStart);
            socketRef.current?.offTypingStop(onTypingStop);
        };
    }, [onMessageReceived, onMessageDeleted, onTypingStart, onTypingStop, profileRef, socketRef]);
};
