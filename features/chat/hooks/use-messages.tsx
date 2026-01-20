"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { MessageState } from "../types/message-state";
import { Message } from "@/packages/shared/types";


export function useMessagesHook(): MessageState {
    // NOTE:  NEED TO USE THREAD ID AS PARAM TO FETCH MESSAGES!

    const [messages, setMessages] = useState<MessageState | null>(null);


    // api call + loading logic here
    const URL = "https://mocki.io/v1/8f726721-2d43-4d32-b3c5-618d38dc40d2";






    useEffect(() => {

        const fetchMockMessages = async (): Promise<void> => {
            const res = await fetch(URL, { method: "GET" });
            const messages: Message[] = await res.json();

            // TODO: NEED TO FIX DATES!



            // to convert to state!
            const result: MessageState = {};
            for (const msg of messages) {
                (result[msg.threadId] ??= []).push(msg);

            }


            setMessages(result);


        }

        fetchMockMessages();
    }, []);


    const handleDeleteMessage = (messageId: string) => {
       setMessages((prev)=>{
        return {...prev,
            ()
        }
       });

       // MANAGE CLOSING STATE OF CONTEXT MENU HERE!
    }



    useEffect(()=>console.log("msgs are!",messages),[messages]);
    








    return messages!;






}
















































