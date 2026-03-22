import { RefObject, useEffect } from "react";
import { type SocketClientType } from "../../../lib/socket-client";
import { Message } from "@chat/shared";
import { Profile } from "@chat/shared/schema/profiles/profile";

interface SocketListenersParams {
    socketRef: RefObject<SocketClientType | null>;
    profileRef: RefObject<Profile>;
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

        // Register listeners
        socketRef.current.on("message:received", onMessageReceived);
        socketRef.current.on("message:deleted", onMessageDeleted);
        socketRef.current.on("typing:start", (threadId, id) => {
            console.log("Received typing start");
            if (profileRef.current?.id !== id) {
                onTypingStart(threadId, id);
            }
        });
        socketRef.current.on("typing:stop", onTypingStop);

        return () => {
            if (socketRef.current) {
                socketRef.current.off("message:received", onMessageReceived);
                socketRef.current.off("message:deleted", onMessageDeleted);
                socketRef.current.off("typing:start");
                socketRef.current.off("typing:stop", onTypingStop);
            }
        };
    }, [onMessageReceived, onMessageDeleted, onTypingStart, onTypingStop]);
};
