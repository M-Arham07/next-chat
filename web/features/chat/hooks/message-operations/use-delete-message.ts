import { RefObject } from "react";
import { Message, MessageStatusType } from "@chat/shared";
import { toast } from "sonner";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
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
        // TODO : BLOCK DELETION IF message.sender !== profileRef.id
        // A user can only delete his OWN messages! 

        const { threadId, msgId, sender } = messageToDelete;

        if (sender !== profileRef.current.id) return;

        // FIRST SET STATUS TO SENDING  (to show loading)

        // TODO :ADD A STATUS LIKE DELETE FAILED AND HANDLE BEHAVIOUR OF RETRY BUTTON DPEENDING ON status? 

        // idk why but this isnt working, need to fix it! 
        updateMessageStatus(threadId, msgId, "sending");

        socketRef.current?.emit("message:delete", messageToDelete, (res) => {
            if (!res.ok) {
                toast.error("Failed to delete message!");

                // if failed, restore original state:
                updateMessageStatus(threadId, msgId, "sent");
                return;
            }

            // if all goes well, update the state for this user:

            removeMessage(threadId, msgId);

            return;
        })
    }

    return { handleDeleteMessage };
};
