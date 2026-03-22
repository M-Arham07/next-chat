import { RefObject } from "react";
import { Message, MessageStatusType } from "@chat/shared";
import { Alert } from "react-native";
import { type SocketClientType } from "../../../lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";

interface UseDeleteMessageParams {
    profileRef: RefObject<Profile>;
    socketRef: RefObject<SocketClientType | null>;
    updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void;
    removeMessage: (threadId: string, msgId: string) => void;
}

export const useDeleteMessage = ({
    profileRef,
    socketRef,
    updateMessageStatus,
    removeMessage,
}: UseDeleteMessageParams) => {
    const handleDeleteMessage = async (messageToDelete: Message): Promise<void> => {
        const { threadId, msgId, sender } = messageToDelete;

        // Only allow users to delete their own messages
        if (sender !== profileRef.current.id) return;

        // Set status to sending to show loading
        updateMessageStatus(threadId, msgId, "sending");

        socketRef.current?.emit("message:delete", messageToDelete, (res) => {
            if (!res?.ok) {
                Alert.alert("Error", "Failed to delete message!");

                // Restore original state if failed
                updateMessageStatus(threadId, msgId, "sent");
                return;
            }

            // Remove message from state
            removeMessage(threadId, msgId);
            return;
        });
    };

    return { handleDeleteMessage };
};
