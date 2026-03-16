import { create } from "zustand";
import type { Thread, Message } from "@shared/types";

interface ChatState {
  threads: Thread[];
  currentThread: Thread | null;
  messages: Record<string, Message[]>; // threadId -> messages
  isLoading: boolean;

  // Actions
  setThreads: (threads: Thread[]) => void;
  setCurrentThread: (thread: Thread | null) => void;
  setMessages: (threadId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateThread: (thread: Thread) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threads: [],
  currentThread: null,
  messages: {},
  isLoading: false,

  setThreads: (threads) => set({ threads }),
  setCurrentThread: (currentThread) => set({ currentThread }),
  setMessages: (threadId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: messages,
      },
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.threadId]: [
          ...(state.messages[message.threadId] || []),
          message,
        ],
      },
    })),
  updateThread: (thread) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === thread.id ? thread : t)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
