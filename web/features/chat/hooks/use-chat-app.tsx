"use client";
import { createContext, Ref, RefObject, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useChatAppStore } from "../store/chatapp.store";
import { useLoader } from "@/store/loader/use-loader";
import { Message, MessageContentType, Thread } from "@chat/shared";
import { MessageState } from "../types";
import { useSession } from "next-auth/react";
import { ChatAppStore } from "../store/chatapp.store";
import filterThreads from "../lib/filter-threads";
import { getSocket, type SocketClientType } from "@/features/chat/lib/socket-client"
import { GetAllChatsResponse } from "@/app/api/get-all-chats/route";
import { GetFileUrlResponse } from "@/app/api/get-file-url/route";
import { toast } from "sonner";
import { optimizeImage } from "../../../lib/optimize-image";
import { optimizeVideo } from "../../../lib/optimize-video";
import { reconstructFileFromBlobUrl } from "@/features/chat/lib/file-utils";
import { GetFileUrl } from "@/features/chat/lib/upload-utils";


interface ChatAppHook extends ChatAppStore {


    handleSendMessage: (
        threadId: string,
        type: Omit<MessageContentType, "deleted">,
        content: string | File,
    ) => Promise<void>,

    handleDeleteMessage: (messageToDelete: Message) => Promise<void>,

    handleRetryMessage: (message: Message) => Promise<void>

    handleTyping: (threadId: string) => void

    stopTypingEmit: (threadId: string) => void

    filteredThreads: Thread[] | null





}

const ChatAppContext = createContext<ChatAppHook | undefined>(undefined);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for non-optimizable files
const MAX_OPTIMIZABLE_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for images/videos before compression

const useChatAppHook = (): ChatAppHook => {


    const store = useChatAppStore();


    const { mounted, messages, threads,
        markMounted, searchQuery, activeFilter,
        setThreads, addMessages,
        replyingToMsg,
        set, updateMessageStatus, updateMessageContent, removeMessage, addTypingUser, removeTypingUser, setUploadingProgress } = store;

    const { data: session } = useSession();

    const { setLoading } = useLoader();


    const socketRef = useRef<SocketClientType | null>(null);





    useEffect(() => {


        const load = async () => {








            if (!socketRef.current) {


                console.log("NO CURRENT SOKCET")


                const res = await fetch("/api/auth/get-session-token", { method: "GET" });

                const sessionToken = await res.json() as string;

                socketRef.current = getSocket(sessionToken);




            }




            if (socketRef.current.connected) {
                console.log("Connected to WEBSOCKET [useChatApp]");
            }




            // REGISTER LISTENERS::: 
            socketRef.current.on("message:received", handleReceiveMessage);
            socketRef.current.on("message:deleted", removeMessage);
            socketRef.current.on("typing:start", (threadId, username) => {

                if (session?.user.username !== username) {
                    addTypingUser(threadId, username);

                }

            });
            socketRef.current.on("typing:stop", removeTypingUser);

            // document.addEventListener("visibilitychange",()=>toast.error("visivility change"));




            if (mounted) return;

            markMounted();
            setLoading(true);




            console.log("FETCHING ALL CHATS ")

            try {

                const res = await fetch("/api/get-all-chats", {
                    method: "GET"
                });


                //TODO: ZOD VALIDATE?


                if (!res.ok) throw new Error("Bad response from SERVER");


                const data: GetAllChatsResponse = await res.json();

                // RETURN TYPE WILL NOT BE NULL IN CASE OF OK RESPONSE

                setThreads(data!.threads);


                // TRANSFORM MESSAGES TO message state eg : "threadId" : "message"


                let result: MessageState = {};

                for (const msg of data!.messages) {
                    (result[msg.threadId] ??= []).push(msg);

                }

                set("messages", result);





                setLoading(false);


            }
            catch (err) {


                if (err instanceof Error) {
                    console.error("[useChatApp] Error while fetching chats on initial load >>", err.message);
                }

                setLoading(false);


                // handling! 





            }


        }













        load();








        return () => {
            setLoading(false);

            // socketRef?.current?.off("message:new");
            // socketRef?.current?.disconnect()
            // socketRef.current = null;
            // console.log("UNMOUNTED_CHAT_APP");   



        }

    }, [session]);



















    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const handleTyping = (threadId: string) => {


        // edge case:
        if (!threadId || !session?.user?.username) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            console.log("TYPING START");


            // emit! 
            socketRef.current?.emit("typing:start", threadId, session.user.username!);

        }

        // STOP (debounced)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            typingTimeoutRef.current = null;
            console.log("TYPING STOP");

            stopTypingEmit(threadId);




        }, 800);
    };




    const stopTypingEmit = (threadId: string) => {

        socketRef.current?.emit("typing:stop", threadId, session?.user?.username! || "");

    }









    const handleDeleteMessage = async (messageToDelete: Message): Promise<void> => {


        // TODO : BLOCK DELETION IF MESSAGE.SENDER !== SESSION.USER.USERNAME
        // A user can only delete his OWN messages! 

        const { threadId, msgId, sender } = messageToDelete;

        if (sender !== session?.user?.username) return;


        // FIRST SET STATUS TO SENDING  (to show loading)

        // TODO :ADD A STATUS LIKE DELETE FAILED AND HANDLE BEHAVIOUR OF RETRY BUTTON DPEENDING ON status? 

        // idk why but this isnt working, need to fix it! 
        updateMessageStatus(threadId, msgId, "sending");


        // API CALL + OTHER THINGS


        socketRef.current?.emit("message:delete", messageToDelete, (res) => {
            if (!res.ok) {

                // if failed, restore original state:
                updateMessageStatus(threadId, msgId, "sent");
                return;
            }


            // if all goes well, update the state for this user:

            removeMessage(threadId, msgId);


            return;


        })







    }


    // useEffect(() => console.log(store.messages), [store.messages])
    const handleSendMessage = async (
        threadId: string,
        type: Omit<MessageContentType, "deleted">,
        content: string | File)
        : Promise<void> => {



        // if message is a file, we'll upload it to supabase, and gets it's url! 

        // but to ensure that file previews are shown quickly on frontend (for loading states),
        // i'll store it in a blob immediately when the send button is clicked , and update the state with the blob as content
        // once the file is uploaded to supabase, i'll update the state with the real url as content





        // If content is a blob URL from a retry, reconstruct the original File object
        let finalContent = content;
        if (type !== "text" && typeof content === "string" && content.startsWith("blob:")) {
            try {
                finalContent = await reconstructFileFromBlobUrl(content);
                // We have the file now, we can revoke the old blob URL
                URL.revokeObjectURL(content.split("#")[0]);
            } catch (err) {
                console.error("Failed to reconstruct file from blob:", err);
                toast.error("Failed to process file for resending");
                return;
            }
        }

        // if file type is Not text and a file, upload it!

        let rawBlobUrl: string | null = null;
        let localBlobUrl: string | null = null;

        if (type !== "text" && finalContent instanceof File) {
            rawBlobUrl = URL.createObjectURL(finalContent);
            localBlobUrl = `${rawBlobUrl}#filename=${encodeURIComponent(finalContent.name)}`;
        }

        let newMessage: Message = {

            msgId: process.env.NODE_ENV === "production" ? crypto.randomUUID() : (Date.now() - Math.random()).toString(),
            threadId: threadId,
            sender: session?.user?.username || "",
            type: type as MessageContentType,
            content: localBlobUrl || (finalContent as string),
            timestamp: new Date(Date.now()).toISOString(),
            replyToMsgId: replyingToMsg?.msgId,
            status: "sending"

        }

      
        // TODO: PARSE VIA ZOD SCHEMA HERE, throw error if not matches it! 

        // append the newMessage to the state, for this thread id!
        // NO NEED TO RESORT!
        addMessages([newMessage]);

        set("replyingToMsg", null);

        let uploadedContentUrl: string | null = null;

        if (type !== "text" && finalContent instanceof File) {

            const isOptimizable = type === "image" || type === "video";
            const currentLimit = isOptimizable ? MAX_OPTIMIZABLE_FILE_SIZE : MAX_FILE_SIZE;

            if (finalContent.size > currentLimit) {
                toast.error(`File size exceeds the maximum limit of ${currentLimit / (1024 * 1024)}MB`);
                updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                return;
            }

            try {
                const { url } = await GetFileUrl(finalContent, (percent) => {
                    setUploadingProgress(newMessage.msgId, percent);
                });
                
                uploadedContentUrl = url;

                // update the message in the store with the real URL instead of local blob
                updateMessageContent(newMessage.threadId, newMessage.msgId, uploadedContentUrl);
                newMessage.content = uploadedContentUrl; // ensure socket emits the real URL

                if (rawBlobUrl) URL.revokeObjectURL(rawBlobUrl);

            } catch (err) {
                console.error("Error during file upload", err);
                toast.error("Failed to upload file");
                updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                return;
            }
        }

        // socketRef.current.emit the message , then use ack! 

        socketRef?.current?.timeout(10000).emit("message:new", newMessage, (err, res) => {

            console.log("Res is", res)

            if (err || !res.ok) {

                console.log(err ? "Send timeout!" : "Error from server");

                updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                return;

            }



            // if everything goes well, update the status! 
            updateMessageStatus(newMessage.threadId, newMessage.msgId, "sent");



        });





        set("replyingToMsg", null);
        return;








    }


    const handleRetryMessage = async (message: Message): Promise<void> => {


        const { threadId, msgId, sender, type, content } = message;

        // Completely nuke the message from state ! 

        

        removeMessage(threadId, msgId, true);


        // Now re-send the message ! 


        await handleSendMessage(threadId, type, content);




    }



    const handleReceiveMessage = (receivedMsg: Message) => {
        console.log("received a message");

        // ZOD PARSE ?


        const isEcho = receivedMsg.sender === session?.user.username;


        console.log(`Received a message from ${receivedMsg.sender}! isEcho ${isEcho} `);



        // (WE WILL ALREADY RECEIVE SORTED MESSAGES FROM BACKEND!)

        addMessages([receivedMsg]);

        return;

    }






    // Filter threads based on search query and active filter
    const filteredThreads = useMemo(() => filterThreads(threads, messages, session, searchQuery, activeFilter),
        [searchQuery, messages, activeFilter, threads]);






    return {
        ...store,
        handleSendMessage,
        filteredThreads,
        handleTyping,
        stopTypingEmit,
        handleDeleteMessage,
        handleRetryMessage
    };




}




export function ChatAppProvider({ children }: { children: React.ReactNode }) {

    const value = useChatAppHook();

    return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>
}


export function useChatApp(): ChatAppHook {

    const ctx = useContext(ChatAppContext)!;

    if (!ctx) throw new Error("Please wrap your /chat route's layout.tsx with ChatAppProvider")
    return ctx;

}