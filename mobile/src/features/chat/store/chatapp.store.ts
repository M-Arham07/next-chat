import { create } from "zustand"
import { ActiveFilter, MessageState } from "../types"
import { Message, MessageStatusType, Thread } from "@chat/shared"

export type NavTab = "threads" | "direct"

export interface ChatAppStore {
  set: <K extends keyof ChatAppStore>(
    key: K,
    value: ChatAppStore[K]
  ) => void
  mounted: boolean
  messages: MessageState | null
  replyingToMsg: Message | null
  threads: Thread[] | null
  activeTab: NavTab
  searchQuery: string
  activeFilter: ActiveFilter
  typingUsers: Record<string, Set<string>>
  uploadingProgress: Record<string, number>

  markMounted: () => void
  setThreads: (threads: Thread[]) => void
  addThread: (newThread: Thread, options: { appendToStart: boolean }) => void
  addMessages: (newMessages: Message[], options?: { resort?: boolean; appendToStart?: boolean }) => void
  updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void
  updateMessageContent: (threadId: string, msgId: string, newContent: string) => void
  removeMessage: (threadId: string, msgId: string, nuke?: boolean) => void

  addTypingUser: (threadId: string, userId: string) => void
  removeTypingUser: (threadId: string, userId: string) => void
  setUploadingProgress: (msgId: string, progress: number) => void
}

export const useChatAppStore = create<ChatAppStore>((set) => ({
  mounted: false,
  messages: null,
  replyingToMsg: null,
  threads: null,
  activeTab: "threads",
  searchQuery: "",
  activeFilter: "all",
  typingUsers: {},
  uploadingProgress: {},

  set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) =>
    set({ [key]: value } as Pick<ChatAppStore, K>),

  markMounted: () => set(() => ({ mounted: true })),
  setThreads: (threads: Thread[] | null) => set(() => ({ threads: threads })),

  addThread: (newThread, options) =>
    set((state) => {
      const { appendToStart } = options

      const doesExist = state.threads?.some((t) => t.threadId === newThread.threadId)

      if (doesExist) return state

      const updatedThreads = appendToStart
        ? [newThread, ...(state.threads ?? [])]
        : [...(state.threads ?? []), newThread]
      return {
        threads: updatedThreads,
      }
    }),

  setMessages: (messages: MessageState) => set(() => ({ messages: messages })),

  addMessages: (newMessages: Message[], options?: { resort?: boolean; appendToStart?: boolean }) =>
    set((state) => {
      const threadId: string = newMessages[0]?.threadId

      const currentMessages: Message[] = state.messages?.[threadId] ?? []

      let updatedMsgs: Message[] = options?.appendToStart
        ? [...newMessages, ...currentMessages]
        : [...currentMessages, ...newMessages]

      const addedMsgIds = new Set<string>()

      updatedMsgs = updatedMsgs.filter((m) => {
        if (addedMsgIds.has(m.msgId)) {
          console.log("[v0] DUPLICATE_MESSAGE_DETECTED")
          return false
        }

        addedMsgIds.add(m.msgId)
        return true
      })

      if (options?.resort) {
        updatedMsgs.sort((msgA, msgB) => {
          const msgAepoch: number = new Date(msgA.timestamp).getTime()
          const msgBepoch: number = new Date(msgB.timestamp).getTime()
          return msgAepoch - msgBepoch
        })
      }

      return {
        messages: {
          ...(state.messages ?? {}),
          [threadId]: updatedMsgs,
        },
      }
    }),

  updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) =>
    set((state) => {
      const idx: number = state.messages![threadId].findIndex((m) => m.msgId === msgId)

      if (idx < 0) return { messages: state.messages }

      let updatedMsgs = [...state.messages![threadId]]

      updatedMsgs[idx].status = newStatus

      return {
        messages: {
          ...state.messages,
          [threadId]: updatedMsgs,
        },
      }
    }),

  updateMessageContent: (threadId: string, msgId: string, newContent: string) =>
    set((state) => {
      const idx: number = state.messages![threadId].findIndex((m) => m.msgId === msgId)

      if (idx < 0) return { messages: state.messages }

      let updatedMsgs = [...state.messages![threadId]]
      updatedMsgs[idx].content = newContent

      return {
        messages: {
          ...state.messages,
          [threadId]: updatedMsgs,
        },
      }
    }),

  removeMessage: (threadId: string, msgId: string, nuke?: boolean) =>
    set((state) => {
      const idx: number = state.messages![threadId].findIndex((m) => m.msgId === msgId)

      if (idx < 0) return { messages: state.messages }

      let updatedMsgs = [...state.messages![threadId]]

      if (nuke) {
        updatedMsgs = updatedMsgs.filter((m) => m.msgId !== msgId)
      } else {
        updatedMsgs[idx] = {
          ...updatedMsgs[idx],
          content: "",
          type: "deleted",
          replyToMsgId: undefined,
        }
      }

      return {
        messages: {
          ...state.messages,
          [threadId]: updatedMsgs,
        },
      }
    }),

  addTypingUser: (threadId: string, userId: string): void =>
    set((state) => {
      const currentlyTyping = state.typingUsers ?? {}
      const currentlyTypingInThread = new Set(currentlyTyping[threadId] ?? [])

      currentlyTypingInThread.add(userId)

      return {
        typingUsers: {
          ...currentlyTyping,
          [threadId]: currentlyTypingInThread,
        },
      }
    }),

  removeTypingUser: (threadId: string, userId: string): void =>
    set((state) => {
      const currentlyTyping = state.typingUsers ?? {}
      const currentlyTypingInThread = new Set(currentlyTyping[threadId] ?? [])

      currentlyTypingInThread.delete(userId)

      return {
        typingUsers: {
          ...currentlyTyping,
          [threadId]: currentlyTypingInThread,
        },
      }
    }),

  setUploadingProgress: (msgId: string, progress: number) =>
    set((state) => ({
      uploadingProgress: {
        ...state.uploadingProgress,
        [msgId]: progress,
      },
    })),
}))
