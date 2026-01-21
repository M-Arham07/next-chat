"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { MessageState } from "../types/message-state";
import { Message } from "@/packages/shared/types";



export interface MessagesHookType {
    messages: MessageState | null,
    handleDeleteMessage: (message: Message) => Promise<boolean>
    handleMessageReply: (message: Message) => void
}
export function useMessagesHook(): MessagesHookType {
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


    const handleDeleteMessage = async (message: Message) => {




        setMessages(prev => {


            // prev cant be null as some message might exist before for this to be deleted!


            // updated messages array for this thread:
            const updatedMsgs: Message[] = prev![message.threadId].map(m => {

                if (m.msgId === message.msgId) {

                    // set message to deleted, and destroy its content!

                    return {
                        ...m,
                        type: "deleted",
                        content: "",
                    };

                }

                return m;
            });



            return {
                ...prev,
                [message.threadId]: updatedMsgs
            };




        });

        // CALL API IN TRY CATCH , and set message loading to true!



        return true;


    }

    const handleMessageReply = (message: Message) => {

        setReplyingToMsg(message);

    }



    useEffect(() => console.log("msgs are!", messages), [messages]);











    return { messages, handleDeleteMessage, handleMessageReply }






}
















































