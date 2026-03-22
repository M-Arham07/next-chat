import { RefObject, useCallback } from "react";
import { Message, MessageContentType, MessageStatusType } from "@chat/shared";
import { type SocketClientType } from "../../../lib/socket-client";
import { messageSchema } from "@chat/shared/schema";
import { MAX_FILE_SIZE, MAX_VIDEO_SIZE_FOR_BROWSER } from "@chat/shared/constants";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";
import { Alert } from "react-native";

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
    const handleSendMessage = useCallback(
        async (threadId: string, type: Omit<MessageContentType, "deleted">, content: string | File): Promise<void> => {
            console.log("Sending message");

            let finalContent = content;

            let currentLimit = MAX_FILE_SIZE;

            let rawBlobUrl: string | null = null;
            let localBlobUrl: string | null = null;

            // For mobile, handle files differently based on the type
            if (type !== "text" && finalContent instanceof File) {
                // For React Native, files need to be handled via the API
                const reader = new FileReader();
                rawBlobUrl = URL.createObjectURL(finalContent);
                localBlobUrl = `${rawBlobUrl}#filename=${encodeURIComponent(finalContent.name)}`;
            }

            let newMessage: Message = {
                msgId: `${Date.now()}-${Math.random()}`,
                threadId: threadId,
                sender: profileRef.current.id,
                type: type as MessageContentType,
                content: localBlobUrl || (finalContent as string),
                timestamp: new Date(Date.now()).toISOString(),
                replyToMsgId: replyingToMsg?.msgId,
                status: "sending",
            };

            if (!messageSchema.safeParse(newMessage).success) {
                Alert.alert("Error", "Failed to send message!");
                return;
            }

            // Validate file size
            if (type === "video") {
                currentLimit = MAX_VIDEO_SIZE_FOR_BROWSER;
                if ((finalContent as File).size > currentLimit) {
                    Alert.alert("Error", `File size exceeds the maximum limit of 5MB`);
                    updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                    return;
                }
            } else if (type !== "text") {
                if ((finalContent as File).size > currentLimit) {
                    Alert.alert("Error", `File size exceeds the maximum limit of ${currentLimit / (1024 * 1024)}MB`);
                    updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                    return;
                }
            }

            // Add message to state
            addMessages([newMessage]);
            set("replyingToMsg", null);

            let uploadedContentUrl: string | null = null;

            // Handle file upload via API
            if (type !== "text" && finalContent instanceof File) {
                try {
                    const formData = new FormData();
                    formData.append("file", finalContent);
                    formData.append("type", type);

                    // Upload file
                    const uploadResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!uploadResponse.ok) {
                        throw new Error("File upload failed");
                    }

                    const uploadData = await uploadResponse.json();
                    uploadedContentUrl = uploadData.url;

                    updateMessageContent(newMessage.threadId, newMessage.msgId, uploadedContentUrl);
                    newMessage.content = uploadedContentUrl;

                    if (rawBlobUrl) URL.revokeObjectURL(rawBlobUrl);
                } catch (err) {
                    console.error("Error during file upload:", err);
                    Alert.alert("Error", "Failed to upload file");
                    updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                    return;
                }
            }

            // Emit via socket
            socketRef?.current?.timeout(10000).emit("message:new", newMessage, (err, res) => {
                console.log("Message send response:", res);

                if (err || !res?.ok) {
                    console.log(err ? "Send timeout!" : "Error from server");
                    updateMessageStatus(newMessage.threadId, newMessage.msgId, "failed");
                    return;
                }

                updateMessageStatus(newMessage.threadId, newMessage.msgId, "sent");
            });

            set("replyingToMsg", null);
        },
        [profileRef, socketRef, replyingToMsg, set, addMessages, updateMessageContent, updateMessageStatus]
    );

    return { handleSendMessage };
};
