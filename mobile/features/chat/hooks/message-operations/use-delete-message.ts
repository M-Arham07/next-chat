import { RefObject } from "react";
import { Alert } from "react-native";
import { Message, MessageStatusType } from "@chat/shared";
import { type SocketClientType } from "../../lib/socket-client";
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

        if (sender !== profileRef.current.id) return;

        updateMessageStatus(threadId, msgId, "sending");

        socketRef.current?.emit("message:delete", messageToDelete, (res) => {
            if (!res.ok) {
                Alert.alert("Error", "Failed to delete message!");
                updateMessageStatus(threadId, msgId, "sent");
                return;
            }
            removeMessage(threadId, msgId);
        });
    };

    return { handleDeleteMessage };
};
