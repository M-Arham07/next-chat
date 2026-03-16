import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { Message, MessageStatusType, Thread } from "@chat/shared";
import { getSocket, SocketClientType } from "../lib/socket-client";
import { useChatAppStore } from "../store/chatapp.store";
import { GetFileUrl } from "../lib/upload-utils";

type TChatContext = {
    handleSendMessage: (
        threadId: string, 
        content: string, 
        type: Message["type"], 
        replyToMsgId?: string,
        file?: { uri: string; name: string; type: string }
    ) => Promise<void>;
    handleDeleteMessage: (msg: Message) => Promise<void>;
    startTyping: (threadId: string, username: string) => void;
    stopTyping: (threadId: string, username: string) => void;
};

const ChatAppContext = createContext<TChatContext | null>(null);

export const useChatApp = () => {
    return useContext(ChatAppContext);
};

export const ChatAppProvider = ({
    children,
    session,
}: {
    children: React.ReactNode;
    session: any; // Using any for expo-auth-session port for now
}) => {
    const { 
        mounted, 
        markMounted, 
        setThreads, 
        addThread, 
        addMessages, 
        updateMessageStatus, 
        removeMessage, 
        addTypingUser, 
        removeTypingUser, 
        setUploadingProgress,
        updateMessageContent
    } = useChatAppStore();
    
    const [socket, setSocket] = useState<SocketClientType | null>(null);
    const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    // We can't use next/navigation router in React Native. 
    // We mock its behavior visually, and the component using this context can handle actual routing.
    
    useEffect(() => {
        markMounted();
        if (!session?.user?.username) return;

        // Mock token logic for RN if missing
        const token = session.token || "mocked-auth-token";
        
        const newSocket = getSocket(token);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to websocket");
        });

        // Event listeners (exact same logic as web, but adapted if needed)
        newSocket.on("receiveMessages", (threadId, newMessages) => {
            const doesThreadExist = useChatAppStore.getState().threads?.some(t => t.threadId === threadId);
            if (!doesThreadExist) {
                // If thread doesn't exist locally, we'd normally fetch it from API
                // For simplicity here, we rely on the component mounting logic to refetch
            }
            if (newMessages.length > 0) {
                addMessages(newMessages, { appendToStart: false, resort: true });
            }
        });

        newSocket.on("errorAuth", () => {
            console.error("Auth error with socket");
        });

        newSocket.on("messageStatus", (threadId, msgId, status) => {
            updateMessageStatus(threadId, msgId, status);
        });

        newSocket.on("deleteMsg", (threadId, msgId, nuke) => {
            removeMessage(threadId, msgId, nuke);
            if (!nuke) updateMessageStatus(threadId, msgId, "sent");
        });

        newSocket.on("newGC", (thread) => {
            addThread(thread, { appendToStart: true });
        });

        newSocket.on("userTyping", (threadId, username) => {
            addTypingUser(threadId, username);
            if (typingTimeouts.current[`${threadId}-${username}`]) {
                clearTimeout(typingTimeouts.current[`${threadId}-${username}`]);
            }
            typingTimeouts.current[`${threadId}-${username}`] = setTimeout(() => {
                removeTypingUser(threadId, username);
            }, 3000);
        });

        newSocket.on("userStoppedTyping", (threadId, username) => {
            removeTypingUser(threadId, username);
            if (typingTimeouts.current[`${threadId}-${username}`]) {
                clearTimeout(typingTimeouts.current[`${threadId}-${username}`]);
            }
        });

        return () => {
            newSocket.disconnect();
            Object.values(typingTimeouts.current).forEach(clearTimeout);
        };
    }, [session?.user?.username]);

    const handleSendMessage = useCallback(async (
        threadId: string, 
        content: string, 
        type: Message["type"], 
        replyToMsgId?: string,
        file?: { uri: string; name: string; type: string }
    ) => {
        if ((!content?.trim() && !file) || !session?.user?.username) return;

        const optimisticId = `temp-${Date.now()}`;
        const timestamp = new Date().toISOString();

        // 1. Optimistic Update
        const optimisticMsg: Message = {
            msgId: optimisticId,
            threadId,
            sender: session.user.username,
            type,
            content: file ? file.uri : content,
            status: "sending",
            timestamp,
            replyToMsgId,
        };

        addMessages([optimisticMsg], { appendToStart: false });

        try {
            let finalContent = content;

            // 2. Upload file if present
            if (file) {
                console.log(`Uploading file for ${optimisticId}`);
                const { url } = await GetFileUrl(file, (progress) => {
                    setUploadingProgress(optimisticId, progress);
                });
                console.log(`Uploaded to ${url}`);
                finalContent = url;

                // Update content from optimistic blob/uri to actual URL
                updateMessageContent(threadId, optimisticId, finalContent);
            }

            // 3. Emit via socket
            socket?.emit(
                "sendMessage",
                threadId,
                finalContent,
                type,
                replyToMsgId,
                optimisticId
            );
        } catch (error) {
            console.error("Message send failed:", error);
            updateMessageStatus(threadId, optimisticId, "failed");
        }
    }, [socket, session?.user?.username, addMessages, updateMessageContent, updateMessageStatus, setUploadingProgress]);

    const handleDeleteMessage = useCallback(async (msg: Message) => {
        // Optimistic delete
        updateMessageStatus(msg.threadId, msg.msgId, "sending");
        removeMessage(msg.threadId, msg.msgId, false);
        socket?.emit("deleteMsg", msg.threadId, msg.msgId);
    }, [socket, updateMessageStatus, removeMessage]);

    const startTyping = useCallback((threadId: string, username: string) => {
        socket?.emit("startTyping", threadId, username);
    }, [socket]);

    const stopTyping = useCallback((threadId: string, username: string) => {
        socket?.emit("stopTyping", threadId, username);
    }, [socket]);

    if (!mounted) return null;

    return (
        <ChatAppContext.Provider value={{ handleSendMessage, handleDeleteMessage, startTyping, stopTyping }}>
            {children}
        </ChatAppContext.Provider>
    );
};
