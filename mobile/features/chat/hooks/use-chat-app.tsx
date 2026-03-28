import { useEffect, useMemo, useCallback } from "react";
import { useChatAppStore, ChatAppStore } from "../store/chatapp.store";
import { Message, MessageContentType, Thread } from "@shared/types";
import { MessageState } from "../types";
import { useAuth } from "@/providers/AuthProvider";
import { filterThreads } from "../lib/filter-threads";
import { supabase } from "@/supabase/supabase-client";

interface ChatAppHook extends ChatAppStore {
  handleSendMessage: (
    type: Omit<MessageContentType, "deleted">,
    content: string | File
  ) => Promise<void>;
  handleDeleteMessage: (messageToDelete: Message) => Promise<void>;
  filteredThreads: Thread[] | null;
}

const useChatApp = (): ChatAppHook => {
  const store = useChatAppStore();

  const {
    mounted,
    messages,
    threads,
    markMounted,
    searchQuery,
    activeFilter,
    setThreads,
    addMessage,
    selectedThreadId,
    replyingToMsg,
    set,
    updateMessageStatus,
    removeMessage,
  } = store;

  const { user } = useAuth();

  // Mock API endpoints - replace with your actual API URLs
  const API_ENDPOINT = `${process.env.EXPO_PUBLIC_BASE_API_URL}/api/threads/inbox`;
  const MESSAGES_ENDPOINT = `${process.env.EXPO_PUBLIC_BASE_API_URL}/api/messages`;

  // For development, use mock data
  const MOCK_THREADS_URL =
    "https://mocki.io/v1/353c786f-5fab-4af4-b388-f918b05e923d";
  const MOCK_MESSAGES_URL =
    "https://mocki.io/v1/ed454f6d-bf4c-49c9-b8d3-75b7554a31bf";

  useEffect(() => {
    if (mounted) return;

    markMounted();

    const fetchMockThreads = async () => {
      try {
        const res = await fetch(MOCK_THREADS_URL, { method: "GET" });

        if (!res.ok) throw new Error("Failed to fetch threads");
        const data = (await res.json()) as Thread[] | null;

        setThreads(data ?? []);
      } catch (err) {
        console.log("Error fetching threads:", err);
      }
    };

    const fetchMockMessages = async (): Promise<void> => {
      try {
        const res = await fetch(MOCK_MESSAGES_URL, { method: "GET" });
        const messagesData: Message[] = await res.json();

        // Convert to state format
        const result: MessageState = {};
        for (const msg of messagesData) {
          msg.timestamp = new Date(msg.timestamp);
          (result[msg.threadId] ??= []).push(msg);
        }

        set("messages", result);
      } catch (err) {
        console.log("Error fetching messages:", err);
      }
    };

    Promise.all([fetchMockThreads(), fetchMockMessages()]);
  }, [mounted]);

  const handleDeleteMessage = useCallback(
    async (messageToDelete: Message): Promise<void> => {
      const { threadId, msgId } = messageToDelete;

      // Set status to sending (to show loading)
      updateMessageStatus(threadId, msgId, "sending");

      try {
        // API call to delete message
        await new Promise<void>((r) => setTimeout(() => r(), 500));

        // If successful, update the state
        removeMessage(messageToDelete);
      } catch (err) {
        console.log("Error deleting message:", err);
        updateMessageStatus(threadId, msgId, "failed");
      }
    },
    [updateMessageStatus, removeMessage]
  );

  const handleSendMessage = useCallback(
    async (
      type: Omit<MessageContentType, "deleted">,
      content: string | File
    ): Promise<void> => {
      try {
        let uploadedContentUrl: string | null = null;

        // If file type is not text, upload it
        if (type !== "text" && typeof content !== "string") {
          // In a real app, you'd upload to Supabase Storage here
          // For now, we'll use the local URI
          uploadedContentUrl = content.toString();
        }

        const newMessage: Message = {
          msgId: crypto.randomUUID?.() || Date.now().toString(),
          threadId: selectedThreadId as string,
          sender: user?.email || "me",
          type: type as MessageContentType,
          content: uploadedContentUrl || (content as string),
          timestamp: new Date(),
          replyToMsgId: replyingToMsg?.msgId,
          status: "sending",
        };

        // Add message to state
        addMessage(newMessage);

        // Simulate API call
        await new Promise<void>((r) => setTimeout(() => r(), 1000));

        // Update status to sent
        updateMessageStatus(newMessage.threadId, newMessage.msgId, "sent");
      } catch (err) {
        console.log("Error sending message:", err);
      } finally {
        set("replyingToMsg", null);
      }
    },
    [selectedThreadId, user, replyingToMsg, addMessage, updateMessageStatus, set]
  );

  // Filter threads based on search query and active filter
  const filteredThreads = useMemo(
    () => filterThreads(threads, messages, user, searchQuery, activeFilter),
    [searchQuery, messages, activeFilter, threads, user]
  );

  return {
    ...store,
    handleSendMessage,
    filteredThreads,
    handleDeleteMessage,
  };
};

export { useChatApp };
