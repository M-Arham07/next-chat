"use client";
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { MessageState } from "../types/message-state";
import { Message, MessageContentType } from "@/packages/shared/types";
import { useThreadsHook } from "./use-threads";
import { useSession } from "next-auth/react";
import { GetFileUrl } from "@/features/upload-avatar/get-url";



export interface MessagesHookType {
    messages: MessageState | null,
    handleDeleteMessage: (message: Message) => Promise<boolean>

    handleSendMessage: (
        type: Omit<MessageContentType, "deleted">,
        content: string | File,

    ) => Promise<void>
    replyingToMsg: Message | null
    setReplyingToMsg: Dispatch<SetStateAction<Message | null>>
}
export function useMessagesHook(): MessagesHookType {
    // NOTE:  NEED TO USE THREAD ID AS PARAM TO FETCH MESSAGES!

    const [messages, setMessages] = useState<MessageState | null>(null);



    // To detect which message is being replied to!
    const [replyingToMsg, setReplyingToMsg] = useState<Message | null>(null);


    const { selectedThreadId } = useThreadsHook();
    const { data: session } = useSession();


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


            // prev[message.threadId] cant be null as some message might exist before for this to be deleted!


            // updated messages array for this thread:
            const updatedMsgs: Message[] = (prev![message.threadId]).map(m => {

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



    useEffect(() => console.log("msgs are!", messages), [messages]);





    // adds message in the state, to the correct threadId
    const addMessage = (newMessage: Message): void => {

        // FIRST ZOD PARSE HERE! 

        if (!newMessage) return;

        setMessages(prev => {
            // updated messages for this thread!

            const safePrev: MessageState = prev ?? {};

            const updatedMsgs = [...(safePrev[newMessage.threadId] ??= []), newMessage]
            return {
                ...safePrev,
                [newMessage.threadId]: updatedMsgs
            }
        });
    }




    const handleSendMessage = async (
        type: Omit<MessageContentType, "deleted">,
        content: string | File): Promise<void> => {


        try {

            // if message is a file, we'll upload it to supabase, and gets it's url! 


            // NOTE: if a message fails to send, i will not remove it from DB! 
            // Just let it stay there, user can later click resend! 





            // if file type is Not text and a file, upload it!
            let uploadedContentUrl: string | null = null;

            if (type !== "text" && content instanceof File) {

                // UPLOAD THE FILE TO SUPABASE!

                const data = await GetFileUrl(content, type);

                if (!data?.url) throw new Error("Uploading file failed at handleSendMessage");

                uploadedContentUrl = data.url;


            }


            let newMessage: Message = {

                msgId: crypto?.randomUUID() || (Date.now() - Math.random()).toString(),
                threadId: selectedThreadId as string,
                sender: session?.user?.username || "",
                type: type as MessageContentType,
                content: uploadedContentUrl || (content as string),
                timestamp: new Date(Date.now()),
                status: "sending"

            }

            
            // TODO: PARSE VIA ZOD SCHEMA HERE, throw error if not matches it! 


            // append the newMessage to the state, for this thread id!
            addMessage(newMessage);




            // socket.emit the message , then use ack! 



            // if all above goes well 


            newMessage.status = "sent";


            // update the state ! 
            addMessage(newMessage);


        }


        catch (err) {

        }

        finally {
            setReplyingToMsg(null);
            return;
        }







    }





















    return {
        messages, handleDeleteMessage,
        handleSendMessage,
        replyingToMsg, setReplyingToMsg
    }






}
















































