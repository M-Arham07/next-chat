import { create } from "zustand";
import { Message, MessageStatusType, Thread } from "@shared/types";
import { NavTab, ActiveFilter, MessageState } from "../types";

export interface ChatAppStore {
  set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) => void;
  mounted: boolean;
  messages: MessageState | null;
  replyingToMsg: Message | null;
  threads: Thread[] | null;
  activeTab: NavTab;
  searchQuery: string;
  selectedThreadId: string | undefined;
  activeFilter: ActiveFilter;
  markMounted: () => void;
  setThreads: (threads: Thread[]) => void;
  addMessage: (newMessage: Message) => void;
  updateMessageStatus: (
    threadId: string,
    msgId: string,
    newStatus: MessageStatusType
  ) => void;
  removeMessage: (messageToDelete: Message) => void;
}

export const useChatAppStore = create<ChatAppStore>((set) => ({
  mounted: false,
  messages: null,
  replyingToMsg: null,
  threads: null,
  activeTab: "threads",
  searchQuery: "",
  selectedThreadId: undefined,
  activeFilter: "all",

  // ACTIONS

  // Generic setter
  set: (key, value) => set({ [key]: value } as any),

  markMounted: () => set(() => ({ mounted: true })),

  setThreads: (threads: Thread[] | null) => set(() => ({ threads: threads })),

  addMessage: (newMessage: Message) =>
    set((state) => {
      const threadId: string = newMessage.threadId;
      const currentMessages: Message[] = state.messages?.[threadId] ?? [];

      return {
        messages: {
          ...(state.messages ?? {}),
          [threadId]: [...currentMessages, newMessage],
        },
      };
    }),

  // Update message status for a particular message of a thread
  updateMessageStatus: (
    threadId: string,
    msgId: string,
    newStatus: MessageStatusType
  ) =>
    set((state) => {
      if (!state.messages?.[threadId]) return { messages: state.messages };

      const idx: number = state.messages[threadId].findIndex(
        (m) => m.msgId === msgId
      );

      if (idx < 0) return { messages: state.messages };

      const updatedMsgs = [...state.messages[threadId]];
      updatedMsgs[idx] = { ...updatedMsgs[idx], status: newStatus };

      return {
        messages: {
          ...state.messages,
          [threadId]: updatedMsgs,
        },
      };
    }),

  // Delete a particular message in a thread
  removeMessage: (messageToDelete: Message) =>
    set((state) => {
      if (!state.messages) return { messages: state.messages };

      const threadId: string = messageToDelete.threadId;

      if (!state.messages[threadId]) return { messages: state.messages };

      const idx: number = state.messages[threadId].findIndex(
        (m) => m.msgId === messageToDelete.msgId
      );

      if (idx < 0) return { messages: state.messages };

      const updatedMsgs = [...state.messages[threadId]];
      updatedMsgs[idx] = {
        ...updatedMsgs[idx],
        content: "",
        type: "deleted",
        replyToMsgId: undefined,
      };

      return {
        messages: {
          ...state.messages,
          [threadId]: updatedMsgs,
        },
      };
    }),
}));
