import { useEffect, useMemo } from "react";
import { useChatAppStore } from "../store/chatapp.store";
import { useLoader } from "@/store/loader/use-loader";
import { Message, MessageContentType, Thread } from "@/packages/shared/types";
import { MessageState } from "../types";
import { GetFileUrl } from "@/features/upload-avatar/get-url";
import { useSession } from "next-auth/react";
import { ChatAppStore } from "../store/chatapp.store";
import filterThreads from "../lib/filter-threads";

interface ChatAppHook extends ChatAppStore {

    handleSendMessage: (type: Omit<MessageContentType, "deleted">,
        content: string | File) => Promise<void>

    filteredThreads: Thread[] | null





}
const useChatApp = (): ChatAppHook => {


    const store = useChatAppStore();

    const { mounted, messages, threads,
        markMounted, searchQuery, activeFilter,
        setThreads, addMessage,
        selectedThreadId, replyingToMsg,
        set, updateMessages } = store;

    const { data: session } = useSession();

    const { setLoading } = useLoader();




    const API_ENDPOINT: string = "https://mocki.io/v1/353c786f-5fab-4af4-b388-f918b05e923d";
    const URL = "https://mocki.io/v1/ed454f6d-bf4c-49c9-b8d3-75b7554a31bf";

    useEffect(() => {


        if (mounted) return;


        markMounted();
        setLoading(true);




        const fetchMockThreads = async () => {


            try {
                const res = await fetch(API_ENDPOINT, { method: "GET" });

                if (!res.ok) throw new Error("FAILED to fetch threads");
                const data = await res.json() as Thread[] | null;


                setThreads(data ?? []);


                setLoading(false);

            }
            catch (err) {

                setLoading(false);
            }

        }




        const fetchMockMessages = async (): Promise<void> => {
            const res = await fetch(URL, { method: "GET" });
            const messages: Message[] = await res.json();


            // TODO: NEED TO FIX DATES!



            // to convert to state!
            const result: MessageState = {};
            for (const msg of messages) {

                msg.timestamp = new Date(msg.timestamp);
                (result[msg.threadId] ??= []).push(msg);


            }
            // TODO: ZOD VALIDATION HERE!


            set("messages", result);


        }



        Promise.all([fetchMockThreads(), fetchMockMessages()]);






        return () => {
            setLoading(false);
        }

    }, []);



    useEffect(() => console.log("Threads are: ", store.threads, "Messages are: ", store.messages), [store.messages, store.threads])



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
                replyToMsgId: replyingToMsg?.msgId,
                status: "sending"

            }


            // TODO: PARSE VIA ZOD SCHEMA HERE, throw error if not matches it! 


            // append the newMessage to the state, for this thread id!
            addMessage(newMessage);



            // socket.emit the message , then use ack! 



            // if all above goes well, update this message's state to sent
            newMessage.status = "sent";

            // FIND INDEX FOR THIS MESSAGE ID ! 
            // MESSAGES MUST EXIST HERE!

            const idx: number = messages![newMessage.threadId].findIndex(m => m.msgId === newMessage.msgId);



            let updatedMsgs = [...messages![newMessage.threadId]]

            updatedMsgs[idx] = newMessage;

            updateMessages(updatedMsgs);






        }


        catch (err) {




        }

        finally {
            set("replyingToMsg", null);
            return;
        }







    }




    // Filter threads based on search query and active filter
    const filteredThreads = useMemo(() => filterThreads(threads, messages, session, searchQuery, activeFilter),
        [searchQuery, messages, activeFilter, threads]);






    return { ...store, handleSendMessage, filteredThreads };




}





export { useChatApp };