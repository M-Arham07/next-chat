import { create } from 'zustand';
import { Message, MessageStatusType, Thread } from '@chat/shared';

export interface MessageState {
  [threadId: string]: Message[];
}

export type ActiveFilter = 'all' | 'unread' | 'groups';

export interface ChatAppStore {
  set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) => void;
  mounted: boolean;
  messages: MessageState | null;
  replyingToMsg: Message | null;
  threads: Thread[] | null;
  activeTab: 'threads' | 'contacts' | 'groups';
  searchQuery: string;
  activeFilter: ActiveFilter;
  typingUsers: Record<string, Set<string>>; // threadId -> set of usernames
  uploadingProgress: Record<string, number>; // msgId -> percent

  markMounted: () => void;
  setThreads: (threads: Thread[]) => void;
  addThread: (
    newThread: Thread,
    options: { appendToStart: boolean }
  ) => void;
  addMessages: (
    newMessages: Message[],
    options?: { resort?: boolean; appendToStart?: boolean }
  ) => void;
  updateMessageStatus: (
    threadId: string,
    msgId: string,
    newStatus: MessageStatusType
  ) => void;
  updateMessageContent: (
    threadId: string,
    msgId: string,
    newContent: string
  ) => void;
  removeMessage: (threadId: string, msgId: string, nuke?: boolean) => void;
  addTypingUser: (threadId: string, userId: string) => void;
  removeTypingUser: (threadId: string, userId: string) => void;
  setUploadingProgress: (msgId: string, progress: number) => void;
}

export const useChatAppStore = create<ChatAppStore>((set) => ({
  mounted: false,
  messages: null,
  replyingToMsg: null,
  threads: null,
  activeTab: 'threads',
  searchQuery: '',
  activeFilter: 'all',
  typingUsers: {},
  uploadingProgress: {},

  // Generic setter for states
  set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) =>
    set({ [key]: value } as Pick<ChatAppStore, K>),

  markMounted: () => set(() => ({ mounted: true })),

  setThreads: (threads: Thread[] | null) =>
    set(() => ({ threads: threads })),

  addThread: (newThread, options) =>
    set((state) => {
      const { appendToStart } = options;

      // Block if already exists
      const doesExist = state.threads?.some(
        (t) => t.threadId === newThread.threadId
      );

      if (doesExist) return state;

      const updatedThreads = appendToStart
        ? [newThread, ...(state.threads ?? [])]
        : [...(state.threads ?? []), newThread];

      return {
        threads: updatedThreads,
      };
    }),

  addMessages: (newMessages, options) =>
    set((state) => {
      if (!newMessages || newMessages.length === 0) return state;

      const resort = options?.resort ?? true;
      const appendToStart = options?.appendToStart ?? false;

      const updatedMessages = { ...(state.messages ?? {}) };

      for (const msg of newMessages) {
        if (!updatedMessages[msg.threadId]) {
          updatedMessages[msg.threadId] = [];
        }

        // Avoid duplicates
        const isDuplicate = updatedMessages[msg.threadId].some(
          (m) => m.msgId === msg.msgId
        );

        if (!isDuplicate) {
          if (appendToStart) {
            updatedMessages[msg.threadId].unshift(msg);
          } else {
            updatedMessages[msg.threadId].push(msg);
          }
        }
      }

      // Sort by timestamp if enabled
      if (resort) {
        for (const threadId in updatedMessages) {
          updatedMessages[threadId].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() -
              new Date(b.timestamp).getTime()
          );
        }
      }

      return { messages: updatedMessages };
    }),

  updateMessageStatus: (threadId, msgId, newStatus) =>
    set((state) => {
      if (!state.messages?.[threadId]) return state;

      const updatedMessages = { ...state.messages };
      const messageIndex = updatedMessages[threadId].findIndex(
        (m) => m.msgId === msgId
      );

      if (messageIndex !== -1) {
        updatedMessages[threadId][messageIndex].status = newStatus;
      }

      return { messages: updatedMessages };
    }),

  updateMessageContent: (threadId, msgId, newContent) =>
    set((state) => {
      if (!state.messages?.[threadId]) return state;

      const updatedMessages = { ...state.messages };
      const messageIndex = updatedMessages[threadId].findIndex(
        (m) => m.msgId === msgId
      );

      if (messageIndex !== -1) {
        updatedMessages[threadId][messageIndex].content = newContent;
      }

      return { messages: updatedMessages };
    }),

  removeMessage: (threadId, msgId) =>
    set((state) => {
      if (!state.messages?.[threadId]) return state;

      const updatedMessages = { ...state.messages };
      updatedMessages[threadId] = updatedMessages[threadId].filter(
        (m) => m.msgId !== msgId
      );

      return { messages: updatedMessages };
    }),

  addTypingUser: (threadId, userId) =>
    set((state) => {
      const updatedTypingUsers = { ...state.typingUsers };
      if (!updatedTypingUsers[threadId]) {
        updatedTypingUsers[threadId] = new Set();
      }
      updatedTypingUsers[threadId].add(userId);
      return { typingUsers: updatedTypingUsers };
    }),

  removeTypingUser: (threadId, userId) =>
    set((state) => {
      const updatedTypingUsers = { ...state.typingUsers };
      if (updatedTypingUsers[threadId]) {
        updatedTypingUsers[threadId].delete(userId);
      }
      return { typingUsers: updatedTypingUsers };
    }),

  setUploadingProgress: (msgId, progress) =>
    set((state) => ({
      uploadingProgress: {
        ...state.uploadingProgress,
        [msgId]: progress,
      },
    })),
}));
