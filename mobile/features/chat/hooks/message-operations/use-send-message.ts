import { RefObject, useRef } from "react";
import { getEnvironmentName, Message, MessageContentType, MessageStatusType } from "@chat/shared";
import { toast } from "@/components/ui/toast";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
import { reconstructFileFromBlobUrl } from "@/features/chat/lib/file-utils";
import { GetFileUrl } from "@/features/chat/lib/upload-utils";
import { messageSchema } from "@chat/shared/schema";
import { MAX_FILE_SIZE, MAX_OPTIMIZABLE_IMAGE_SIZE, MAX_VIDEO_SIZE_FOR_BROWSER } from "@chat/shared/constants";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";

interface UseSendMessageParams {
    profileRef: RefObject<Profile>;
    socketRef: RefObject<SocketClientType | null>;
    replyingToMsg: Message | null;
    set: (key: keyof ChatAppStore, value: any) => void;
    addMessages: (msgs: Message[]) => void;
    updateMessageContent: (threadId: string, msgId: string, content: string) => void;
    updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void;
    setUploadingProgress: (msgId: string, percent: number) => void;
}

export const useSendMessage = ({
    profileRef,
    socketRef,
    replyingToMsg,
    set,
    addMessages,
    updateMessageContent,
    updateMessageStatus,
    setUploadingProgress,
}: UseSendMessageParams) => {
    const handleSendMessage = async (
        threadId: string,
        type: Omit<MessageContentType, "deleted">,
        content: string | File)
        : Promise<void> => {

            console.log("hi from handlesend")
            
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



          let currentLimit = MAX_FILE_SIZE;




        

        // store the message as a blob in state before its uploaded
        // so that preview can be shown instantly

        let rawBlobUrl: string | null = null;
        let localBlobUrl: string | null = null;

        if (type !== "text" && finalContent instanceof File) {
            rawBlobUrl = URL.createObjectURL(finalContent);
            localBlobUrl = `${rawBlobUrl}#filename=${encodeURIComponent(finalContent.name)}`;
        }

        let newMessage: Message = {
            msgId: process.env.NODE_ENV === "production" ? crypto.randomUUID() : (Date.now() - Math.random()).toString(),
            threadId: threadId,
            sender: profileRef.current.id,
            type: type as MessageContentType,
            content: localBlobUrl || (finalContent as string),
            timestamp: new Date(Date.now()).toISOString(),
            replyToMsgId: replyingToMsg?.msgId,
            status: "sending"
        }


        if (!messageSchema.safeParse(newMessage).success) {
            toast.error("Failed to send message!");
            return;
        }



        
           // if its video : 
            if (type === "video") {
                currentLimit = MAX_VIDEO_SIZE_FOR_BROWSER;
                if ((finalContent as File).size > currentLimit) {
                    toast.error(`Please download our ${getEnvironmentName().toUpperCase()} app to upload ${type}s larger than 5MB.`);
                    updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                    return;
                }
            } else {
                if ((finalContent as File).size > currentLimit) {
                    toast.error(`File size exceeds the maximum limit of ${currentLimit / (1024 * 1024)}MB`);
                    updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                    return;
                }
            }

        // TODO: PARSE VIA ZOD SCHEMA HERE, throw error if not matches it! 

        // append the newMessage to the state, for this thread id!
        // NO NEED TO RESORT!
        addMessages([newMessage]);

        set("replyingToMsg", null);

        let uploadedContentUrl: string | null = null;

        // if its a file : 

        if (type !== "text" && finalContent instanceof File) {
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
    return { handleSendMessage };
};
