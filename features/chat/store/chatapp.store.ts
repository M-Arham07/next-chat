import { create } from "zustand";
import { ActiveFilter, MessageState } from "../types";
import { Message, Thread } from "@/packages/shared/types";
import { NavTab } from "@/app/chat/_components/layout";
import { any } from "zod";



export interface ChatAppStore {

    set: <K extends keyof ChatAppStore>(
        key: K,
        value: ChatAppStore[K]
    ) => void,
    mounted: boolean,
    messages: MessageState | null,
    replyingToMsg: Message | null,
    threads: Thread[] | null,
    activeTab: NavTab,
    searchQuery: string,
    selectedThreadId: string | undefined,
    activeFilter: ActiveFilter,
    markMounted: () => void
    setThreads: (threads: Thread[]) => void
    addMessage: (newMessage: Message) => void
    updateMessages: (updatedMsgs: Message[]) => void

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

    // generic setter
    set: (key: string, value: string) =>
        set({ [key]: value } as any),

    markMounted: () => set(() => ({ mounted: true })),
    setThreads: (threads: Thread[] | null) => set(() => ({ threads: threads })),
    setMessages: (messages: MessageState) => set(() => ({ messages: messages })),




    addMessage: (newMessage: Message) => set((state) => ({
        messages: {
            ...state.messages,
            [newMessage.threadId]: [...(state.messages ?? {})[newMessage.threadId] ??= [], newMessage]
        }
    })),


    // Update messages array for a particular thread! 

    updateMessages: (updatedMsgs: Message[]) => set((state) => ({

        messages: {
            ...state.messages,
            [updatedMsgs[0].threadId]: updatedMsgs
        }

    })),


  





}))