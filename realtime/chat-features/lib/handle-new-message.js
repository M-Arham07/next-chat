import {} from "@chat/shared";
import { messageSchema } from "@chat/shared/schema/message.ts";
import { supabase } from "../../supabase/supabase.ts";
import { logger } from "../../lib/logger.ts";
export const handleNewMessage = async (socket, newMessage, ack) => {
    try {
        messageSchema.parse(newMessage);
        newMessage.status = "sent";
        if (socket.profile.id !== (newMessage.senderUserId ?? newMessage.sender)) {
            throw new Error("SENDER_MISMATCH");
        }
        const { error: dbInsertError } = await supabase.rpc("store_message_from_realtime", {
            p_msg_id: newMessage.msgId,
            p_thread_id: newMessage.threadId,
            p_sender_user_id: socket.profile.id,
            p_sender_device_id: newMessage.senderDeviceId ?? null,
            p_sender: newMessage.sender,
            p_type: newMessage.type,
            p_content: newMessage.content,
            p_content_format: newMessage.contentFormat ?? "legacy_plaintext",
            p_key_version: newMessage.keyVersion ?? null,
            p_reply_to_msg_id: newMessage.replyToMsgId ?? null,
            p_status: newMessage.status,
            p_timestamp: newMessage.timestamp,
            p_ciphertext: newMessage.encryptedPayload?.ciphertext ?? null,
            p_iv: newMessage.encryptedPayload?.iv ?? null,
            p_algorithm: newMessage.encryptedPayload?.algorithm ?? null,
            p_aad: newMessage.encryptedPayload?.aad ?? null,
        });
        if (dbInsertError) {
            throw new Error(dbInsertError.message);
        }
        socket.to(newMessage.threadId).emit("message:received", newMessage);
        logger.db(`Message ${newMessage.msgId} emitted to thread:${newMessage.threadId}`);
        ack({ ok: true, data: "SENT_OK" });
    }
    catch (err) {
        if (err instanceof Error) {
            logger.error("[handleNewMessage] Failed to send message >>", err.message);
        }
        ack({ ok: false, data: "SEND_FAILED" });
    }
};
//# sourceMappingURL=handle-new-message.js.map