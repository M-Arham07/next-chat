import { Message, MessageContentType } from "@chat/shared";
import type { MobileFilePayload } from "./use-send-message";

interface UseRetryMessageParams {
  removeMessage: (threadId: string, msgId: string, nuke?: boolean) => void;
  handleSendMessage: (
    threadId: string,
    type: Omit<MessageContentType, "deleted">,
    content: string | MobileFilePayload
  ) => Promise<void>;
}

export const useRetryMessage = ({
  removeMessage,
  handleSendMessage,
}: UseRetryMessageParams) => {
  const handleRetryMessage = async (message: Message): Promise<void> => {
    const { threadId, msgId, type, content } = message;

    // Nuke the failed message from state completely
    removeMessage(threadId, msgId, true);

    // Re-send with same content (local URI still valid for the session)
    await handleSendMessage(threadId, type, content);
  };

  return { handleRetryMessage };
};
