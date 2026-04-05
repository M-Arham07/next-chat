import { Message, MessageContentType } from "@chat/shared";

interface UseRetryMessageParams {
    removeMessage: (threadId: string, msgId: string, skipSort?: boolean) => void;
    handleSendMessage: (threadId: string, type: Omit<MessageContentType, "deleted">, content: string | File) => Promise<void>;
}

export const useRetryMessage = ({
    removeMessage,
    handleSendMessage,
}: UseRetryMessageParams) => {
    const handleRetryMessage = async (message: Message): Promise<void> => {
        const { threadId, msgId, type, content } = message;

        // Completely nuke the message from state ! 

        removeMessage(threadId, msgId, true);

        // Now re-send the message ! 

        await handleSendMessage(threadId, type, content);
    }

    return { handleRetryMessage };
};
