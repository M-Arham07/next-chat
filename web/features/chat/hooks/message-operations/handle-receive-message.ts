import { Message } from "@chat/shared";
import { messageSchema } from "@chat/shared/schema";

export const handleReceiveMessage = async (
    receivedMsg: Message,
    addMessages: (msgs: Message[]) => void,
): Promise<void> => {
    const parsed = messageSchema.safeParse(receivedMsg);

    if (!parsed.success) {
        return;
    }

    // RealtimeChatClient already fetches envelope/media metadata and hydrates
    // encrypted content before emitting the message to the app layer.
    addMessages([receivedMsg]);
};
