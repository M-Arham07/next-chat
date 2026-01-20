"use client";

// ONE SINGLE HOOK FOR ALL CHAT FUNCTIONS, under the same provider ! 

import React, { createContext, useContext, useEffect, useState } from "react";
import { MessagesHookType, useMessagesHook } from "./use-messages";
import { useThreadsHook, ThreadsHook } from "./use-threads";
import { MessageState } from "../types";



// it returns a SINGLE object containing 
// {messages , (rest of the return values in useThreadsHook()) }

type ChatAppHook = {
    mounted : boolean
} & ThreadsHook & MessagesHookType


const ChatAppContext = createContext<ChatAppHook | undefined>(undefined);

export function ChatAppProvider({ children }: { children: React.ReactNode }) {

    const messagesHook = useMessagesHook();

    const threadHook = useThreadsHook();

    //  TO AVOID HYDRATION ERROR: 
    const [mounted, setIsMounted] = useState(false);

    useEffect(()=>{
        setIsMounted(true);

        return () => setIsMounted(false);
    },[])


    const value: ChatAppHook = { ...messagesHook, ...threadHook, mounted };

    return (
        <>
            <ChatAppContext.Provider value={value}>
                {children}
            </ChatAppContext.Provider>
        </>
    );



}


// TO CONSUME THE HOOK: 
export function useChatApp(): ChatAppHook | undefined {
    const ctx = useContext(ChatAppContext);
    

    if (!ctx) throw new Error("no ctx found for useChatApp!");
    return ctx;

}