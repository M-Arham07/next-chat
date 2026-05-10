import type { Message } from "@chat/shared";
import { decryptThreadMessage } from "./thread-bootstrap";

export const hydrateMessagesForDisplay = async (
    userId: string,
    messages: Message[],
): Promise<Message[]> => {
    return await Promise.all(messages.map(async (message) => {
        if (message.contentFormat !== "e2ee_text" || !message.encryptedPayload || !message.keyVersion) {
            return message;
        }

        try {
            const decryptedContent = await decryptThreadMessage(
                userId,
                message.threadId,
                message.keyVersion,
                message.encryptedPayload,
            );

            return {
                ...message,
                content: decryptedContent,
            };
        } catch {
            return {
                ...message,
                content: "[Unable to decrypt message]",
            };
        }
    }));
};
