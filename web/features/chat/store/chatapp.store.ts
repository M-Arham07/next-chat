import { create } from "zustand";
import { ActiveFilter, MessageState } from "../types";
import { Message, MessageStatusType, Thread } from "@chat/shared";
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
    typingUsers: Record<string, Set<string>>, // eg: "thread1":["user1","user3"],



    markMounted: () => void
    setThreads: (threads: Thread[]) => void
    addThread: (newThread: Thread, options: { appendToStart: boolean }) => void
    addMessages: (newMessages: Message[], options?: { resort?: boolean, appendToStart?: boolean }) => void
    updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void
    removeMessage: (threadId: string, msgId: string, nuke?: boolean) => void

    addTypingUser: (threadId: string, username: string) => void
    removeTypingUser: (threadId: string, username: string) => void

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
    typingUsers: {},



    // =====ACTIONS===

    // generic setter for states eg : set("stateName",val);

    set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) =>
        set({ [key]: value } as Pick<ChatAppStore, K>),


    markMounted: () => set(() => ({ mounted: true })),
    setThreads: (threads: Thread[] | null) => set(() => ({ threads: threads })),


    addThread: (newThread, options) => set((state) => {

        const { appendToStart } = options;

        // BLOCK IF ALREADY EXISTS! 

        const doesExist = state.threads?.some(t => t.threadId === newThread.threadId);
    


        if (doesExist) return state;

        const updatedThreads = appendToStart ? [newThread, ...(state.threads ?? []),] : [...(state.threads ?? []), newThread]
        return {
            threads: updatedThreads
        }


    }),


    setMessages: (messages: MessageState) => set(() => ({ messages: messages })),




    // Add messages to a threadId (PERFORMS A RESORT BASED ON TIMESTAMP IF sort is true)
    // If append to back is true, the newMessages array will be appended at start,
    // otherwise they'll be appended at end! 
    addMessages: (newMessages: Message[], options?: { resort?: boolean, appendToStart?: boolean }) => set((state) => {


        const threadId: string = newMessages[0]?.threadId;



        const currentMessages: Message[] = state.messages?.[threadId] ?? [];



        let updatedMsgs: Message[] = options?.appendToStart ? [...newMessages, ...currentMessages] : [...currentMessages, ...newMessages];


        // Remove duplicates:

        // set will keep track of added message ids
        const addedMsgIds = new Set<string>();


        updatedMsgs = updatedMsgs.filter(m => {


            // if this msg id is already appended to the set, remove it from updated messages:
            if (addedMsgIds.has(m.msgId)) return false;


            // if not already added, append it to m.msgId: 
            addedMsgIds.add(m.msgId);

            // hence include the current object in updatedMsgs! 

            return true;


        });





        if (options?.resort) {
            console.log("resorting msgs")

            updatedMsgs.sort((msgA, msgB) => {


                // convert to epoch
                let msgAepoch: number = new Date(msgA.timestamp).getTime();
                let msgBepoch: number = new Date(msgB.timestamp).getTime();



                // if the result is a -ve number, msgA will come before msgB
                // if result is a +ve numver ,msgB will come before msgA
                // if the result is 0 ,order will remain same

                // Epoch of a newer message is MORE than epoch of an older message



                return msgBepoch - msgAepoch;

            })

        }


        return {
            messages: {
                ...(state.messages ?? {}),
                [threadId]: updatedMsgs
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

    removeMessage: (threadId: string, msgId: string, nuke?: boolean) => set((state) => {


        // state.messages must exist before for a message to be deleted!


        // FIND INDEX OF THE MESSAGE IN THE THREAD

        const idx: number = state.messages![threadId].findIndex(m => m.msgId === msgId);

        if (idx < 0) return { messages: state.messages };



        // updatedMsgs array for this thread id
        let updatedMsgs = [...state.messages![threadId]];



        // if mode is nuke,  COMPLETELY DELETE THE MESSAGE (NO TRACES LEFT!)
        // this will be used when retrying to send a message!
        if (nuke) {
            updatedMsgs = updatedMsgs.filter(m => m.msgId !== msgId);
        }

        else {
            updatedMsgs[idx] = {
                ...updatedMsgs[idx],
                content: "",
                type: "deleted",
                replyToMsgId: undefined,
            };
        }




        return {
            messages: {
                ...state.messages,
                [threadId]: updatedMsgs
            }
        }




    }),

    addTypingUser: (threadId: string, username: string): void => set((state) => {

        const currentlyTyping = state.typingUsers ?? {};
        const currentlyTypingInThread = new Set(currentlyTyping[threadId] ?? []);

        currentlyTypingInThread.add(username);


        return {

            typingUsers: {
                ...currentlyTyping,
                [threadId]: currentlyTypingInThread
            }

        }






    }),


    removeTypingUser: (threadId: string, username: string): void => set((state) => {

        const currentlyTyping = state.typingUsers ?? {};
        const currentlyTypingInThread = new Set(currentlyTyping[threadId] ?? []);


        currentlyTypingInThread.delete(username);



        return {

            typingUsers: {
                ...currentlyTyping,
                [threadId]: currentlyTypingInThread
            }

        }






    })












}))