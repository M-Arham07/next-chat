"use client";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useChatAppStore } from "../store/chatapp.store";
import { useLoader } from "@/store/loader/use-loader";
import { Message, MessageContentType, Thread } from "@chat/shared";
import { MessageState } from "../types";
import { GetFileUrl } from "@/features/upload-avatar/get-url";
import { useSession } from "next-auth/react";
import { ChatAppStore } from "../store/chatapp.store";
import filterThreads from "../lib/filter-threads";
import { getSocket, type SocketClientType } from "@/features/chat/lib/socket-client"
import { GetAllChatsResponse } from "@/app/api/get-all-chats/route";

interface ChatAppHook extends ChatAppStore {


    handleSendMessage: (type: Omit<MessageContentType, "deleted">,
        content: string | File) => Promise<void>

    handleDeleteMessage: (messageToDelete: Message) => Promise<void>

    filteredThreads: Thread[] | null





}

const ChatAppContext = createContext<ChatAppHook | undefined>(undefined);

const useChatAppHook = (): ChatAppHook => {


    const store = useChatAppStore();


    const { mounted, messages, threads,
        markMounted, searchQuery, activeFilter,
        setThreads, addMessage,
        selectedThreadId, replyingToMsg,
        set, updateMessageStatus, removeMessage } = store;

    const { data: session } = useSession();

    const { setLoading } = useLoader();


    const socketRef = useRef<SocketClientType | null>(null);





    useEffect(() => {

        const load = async () => {







            if (!socketRef.current) {
                
          
                const res = await fetch("/api/auth/get-session-token", { method: "GET" });

                const sessionToken = await res.json() as string;

                socketRef.current = getSocket(sessionToken);

                


            }




            if (socketRef.current.connected) {
                console.log("Connected to WEBSOCKET [useChatApp (51)]");

                // ADD LISTENER FOR NEW MESSAGES!
                socketRef.current.on("message:received", handleReceiveMessage);

            }



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
            socketRef?.current?.off("message:new");
            socketRef?.current?.disconnect()
            socketRef.current = null;


        }

    }, [session]);







    const handleDeleteMessage = async (messageToDelete: Message): Promise<void> => {

        // TODO : BLOCK DELETION IF MESSAGE.SENDER !== SESSION.USER.USERNAME
        // A user can only delete his OWN messages! 


        const { threadId, msgId } = messageToDelete;


        // FIRST SET STATUS TO SENDING  (to show loading)

        // TODO :ADD A STATUS LIKE DELETE FAILED AND HANDLE BEHAVIOUR OF RETRY BUTTON DPEENDING ON status? 

        // idk why but this isnt working, need to fix it! 
        updateMessageStatus(threadId, msgId, "sending");
        console.log("updated status OK");


        // API CALL + OTHER THINGS

        await new Promise<void>(r => setTimeout(() => r(), 500));


        // if above success, UPDATE THE STATE
        removeMessage(messageToDelete);






    }


    // useEffect(() => console.log(store.messages), [store.messages])
    const handleSendMessage = async (
        type: Omit<MessageContentType, "deleted">,
        content: string | File): Promise<void> => {


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
            replyToMsgId: replyingToMsg?.msgId,
            status: "sending"

        }






        // TODO: PARSE VIA ZOD SCHEMA HERE, throw error if not matches it! 


        // append the newMessage to the state, for this thread id!
        // NO NEED TO RESORT!
        addMessage(newMessage, false);





        // socketRef.current.emit the message , then use ack! 


        socketRef?.current?.timeout(20000).emit("message:new", newMessage, (err, res) => {

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



    const handleReceiveMessage = (receivedMsg: Message) => {

        // ZOD PARSE ?


        const isEcho = receivedMsg.sender === session?.user.username;


        console.log(`Received a message from ${receivedMsg.sender}! isEcho ${isEcho} `);



        // IF MESSAGE DOESENT EXIST ALREADY, IT WILL BE APPENDED TO MESSAGES STATE, AND RESORTED (as flag is true)

        addMessage(receivedMsg, true);

        return;

    }






    // Filter threads based on search query and active filter
    const filteredThreads = useMemo(() => filterThreads(threads, messages, session, searchQuery, activeFilter),
        [searchQuery, messages, activeFilter, threads]);






    return { ...store, handleSendMessage, filteredThreads, handleDeleteMessage };




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