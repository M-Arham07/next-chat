import { create } from "zustand";

export interface Message {
  id: string;
  threadId: string;
  userId: string;
  content: string;
  mediaType?: "image" | "document" | "voice";
  mediaUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface Thread {
  id: string;
  name: string;
  type: "direct" | "group";
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

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
