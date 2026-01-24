import { create } from "zustand";
import { ActiveFilter, MessageState } from "../types";
import { Message, MessageStatusType, Thread } from "@/packages/shared/types";
import { NavTab } from "@/app/chat/_components/layout";


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
    updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void
    removeMessage: (messageToDelete: Message) => void
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




    addMessage: (newMessage: Message) => set((state) => {


        const threadId: string = newMessage.threadId;

        const currentMessages: Message[] = state.messages?.[threadId] ?? [];


        return {
            messages: {
                ...(state.messages ?? {}),
                [threadId]: [...currentMessages, newMessage]
            }
        }


    }),




    // Update message status for a particular message of a thread! 
    // (will be mainly used to update the status of a message after handleSendMessage is fired!)

    updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => set((state) => {


        // MESSAGES MUST EXIST HERE!
        const idx: number = state.messages![threadId].findIndex(m => m.msgId === msgId);


        // IF THE GIVEN MESSAGE ID ISN'T FOUND IN THE GIVEN THREAD ID:
        if (idx < 0) return { messages: state.messages };


        let updatedMsgs = [...state.messages![threadId]];


        // UPDATE THE STATUS
        updatedMsgs[idx].status = newStatus;



        // FINALLY, SET STATE TO THE UPDATED MESSSAGES!


        return {
            messages: {
                ...state.messages,
                [threadId]: updatedMsgs
            }
        }





    }),










    




    // Delete a particular message in a thread 

    removeMessage: (messageToDelete: Message) => set((state) => {


        // state.messages must exist before for a message to be deleted!

        const threadId: string = messageToDelete.threadId;

        // FIND INDEX OF THE MESSAGE IN THE THREAD

        const idx: number = state.messages![threadId].findIndex(m => m.msgId === messageToDelete.msgId);

        if (idx < 0) return { messages: state.messages };



        // updatedMsgs array for this thread id
        let updatedMsgs = [...state.messages![threadId]];

        updatedMsgs[idx] = {
            ...updatedMsgs[idx],
            content: "",
            type: "deleted",
            replyToMsgId: undefined,
        };




        return {
            messages: {
                ...state.messages,
                [threadId]: updatedMsgs
            }
        }




    })








}))