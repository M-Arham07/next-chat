import { createContext, useContext, useEffect, useRef } from "react";
import { useChatAppStore } from "../store/chatapp.store";
import { useLoader } from "@/store/loader/use-loader";
import { Message, MessageContentType, Thread } from "@chat/shared";
import { ChatAppStore } from "../store/chatapp.store";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { useSocketSetup } from "./socket/use-socket-setup";
import { useSocketListeners } from "./socket/use-socket-listeners";
import { useInitialLoad } from "./initial-load/use-initial-load";
import { useTypingState } from "./typing/use-typing-state";
import { useDeleteMessage } from "./message-operations/use-delete-message";
import { useSendMessage, MobileFilePayload } from "./message-operations/use-send-message";
import { useRetryMessage } from "./message-operations/use-retry-message";
import { handleReceiveMessage } from "./message-operations/handle-receive-message";
import { useFilteredThreads } from "./utils/use-filtered-threads";

interface ChatAppHook extends ChatAppStore {
  handleSendMessage: (
    threadId: string,
    type: Omit<MessageContentType, "deleted">,
    content: string | MobileFilePayload
  ) => Promise<void>;
  handleDeleteMessage: (messageToDelete: Message) => Promise<void>;
  handleRetryMessage: (message: Message) => Promise<void>;
  handleTyping: (threadId: string) => void;
  stopTypingEmit: (threadId: string) => void;
  filteredThreads: Thread[] | null;
}

const ChatAppContext = createContext<ChatAppHook | undefined>(undefined);

const useChatAppHook = (): ChatAppHook => {
  const store = useChatAppStore();

  const {
    mounted,
    messages,
    threads,
    markMounted,
    searchQuery,
    activeFilter,
    setThreads,
    addMessages,
    replyingToMsg,
    set,
    updateMessageStatus,
    updateMessageContent,
    removeMessage,
    addTypingUser,
    removeTypingUser,
    setUploadingProgress,
  } = store;

  const { profile } = useAuth();

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const { setLoading } = useLoader();

  const socketRef = useSocketSetup(profile);

  const { handleTyping, stopTypingEmit } = useTypingState({ profile, socketRef });

  useSocketListeners({
    socketRef,
    profileRef,
    onMessageReceived: (msg: Message) =>
      handleReceiveMessage(msg, profileRef, addMessages),
    onMessageDeleted: (threadId: string, msgId: string) =>
      removeMessage(threadId, msgId),
    onTypingStart: (threadId: string, id: string) =>
      addTypingUser(threadId, id),
    onTypingStop: (threadId: string, id: string) =>
      removeTypingUser(threadId, id),
  });

  useInitialLoad({
    mounted,
    socketRef,
    markMounted,
    setThreads,
    set,
    setLoading,
    profile,
  });

  const { handleDeleteMessage } = useDeleteMessage({
    profileRef,
    socketRef,
    updateMessageStatus,
    removeMessage,
  });

  const { handleSendMessage } = useSendMessage({
    profileRef,
    socketRef,
    replyingToMsg,
    set,
    addMessages,
    updateMessageContent,
    updateMessageStatus,
    setUploadingProgress,
  });

  const { handleRetryMessage } = useRetryMessage({
    removeMessage,
    handleSendMessage,
  });

  const filteredThreads = useFilteredThreads({
    threads: threads || [],
    messages: messages || {},
    profile,
    searchQuery,
    activeFilter,
  });

  return {
    ...store,
    handleSendMessage,
    filteredThreads,
    handleTyping,
    stopTypingEmit,
    handleDeleteMessage,
    handleRetryMessage,
  };
};

export function ChatAppProvider({ children }: { children: React.ReactNode }) {
  const value = useChatAppHook();
  return (
    <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>
  );
}

export function useChatApp(): ChatAppHook {
  const ctx = useContext(ChatAppContext)!;
  if (!ctx)
    throw new Error(
      "Please wrap your screen with ChatAppProvider"
    );
  return ctx;
}
