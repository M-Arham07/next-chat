import type { Message } from "@chat/shared";
import { measureAsync, recordPerf } from "./debug";
import { decryptThreadMessage } from "./thread-bootstrap";

export const hydrateMessagesForDisplay = async (
    userId: string,
    messages: Message[],
): Promise<Message[]> => {
    const startedAt = performance.now();
    const decryptPromises = new Map<string, Promise<string>>();

    const hydrated = await Promise.all(messages.map(async (message) => {
        if (message.contentFormat !== "e2ee_text" || !message.encryptedPayload || !message.keyVersion) {
            return message;
        }

        try {
            const keyVersion = message.keyVersion;
            const encryptedPayload = message.encryptedPayload;
            const cacheKey = `${message.threadId}:${message.keyVersion}:${message.msgId}`;
            let decryptPromise = decryptPromises.get(cacheKey);

            if (!decryptPromise) {
                decryptPromise = measureAsync("crypto.message.decrypt-for-display", async () => await decryptThreadMessage(
                    userId,
                    message.threadId,
                    keyVersion,
                    encryptedPayload,
                ), {
                    threadId: message.threadId,
                    keyVersion,
                });
                decryptPromises.set(cacheKey, decryptPromise);
            }

            const decryptedContent = await decryptPromise;

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

    recordPerf("hydrate.messages.total", performance.now() - startedAt, {
        messageCount: messages.length,
        encryptedCount: messages.filter((message) => message.contentFormat === "e2ee_text").length,
    });

    return hydrated;
};
