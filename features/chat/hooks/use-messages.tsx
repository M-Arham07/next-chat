"use client";
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { MessageState } from "../types/message-state";
import { Message } from "@/packages/shared/types";



export interface MessagesHookType {
    messages: MessageState | null,
    handleDeleteMessage: (message: Message) => Promise<boolean>
    handleSendMessage: (message: Message) => Promise<void>
    replyingToMsg: Message | null
    setReplyingToMsg: Dispatch<SetStateAction<Message | null>>
}
export function useMessagesHook(): MessagesHookType {
    // NOTE:  NEED TO USE THREAD ID AS PARAM TO FETCH MESSAGES!

    const [messages, setMessages] = useState<MessageState | null>(null);


    // To detect which message is being replied to!
    const [replyingToMsg, setReplyingToMsg] = useState<Message | null>(null);


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



    useEffect(() => console.log("msgs are!", messages), [messages]);




    const handleSendMessage = async (message: Message): Promise<void> => {
        const timestamp = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });


        if (type === "voice" && audioUrl) {
            const newMessage: Message = {
                id: Date.now().toString(),
                timestamp,
                isSent: true,
                isRead: false,
                type: "voice",
                voiceUrl: audioUrl,
                voiceDuration: duration || "0:00",
                status: "sending",
                replyTo: replyingToMsg
                    ? {
                        name: "You",
                        content: replyingToMsg.content,
                        messageId: replyingToMsg.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingToMsg(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        } else if (type === "image" && audioUrl) {
            const newMessage: Message = {
                id: Date.now().toString(),
                timestamp,
                isSent: true,
                isRead: false,
                type: "image",
                imageUrl: audioUrl,
                status: "sending",
                replyTo: replyingToMsg
                    ? {
                        name: "You",
                        content: replyingToMsg.content,
                        messageId: replyingToMsg.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingToMsg(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        } else if (type === "document" && fileData) {
            const newMessage: Message = {
                id: Date.now().toString(),
                timestamp,
                isSent: true,
                isRead: false,
                type: "document",
                documentName: fileData.name,
                documentUrl: fileData.url,
                status: "sending",
                replyTo: replyingToMsg
                    ? {
                        name: "You",
                        content: replyingToMsg.content,
                        messageId: replyingToMsg.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingToMsg(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        } else if (content.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                content,
                timestamp,
                isSent: true,
                isRead: false,
                type: "text",
                status: "sending",
                replyTo: replyingToMsg
                    ? {
                        name: "You",
                        content: replyingToMsg.content,
                        messageId: replyingToMsg.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingToMsg(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        }
    }





















    return {
        messages, handleDeleteMessage,
        handleSendMessage,
        replyingToMsg, setReplyingToMsg
    }






}
















































