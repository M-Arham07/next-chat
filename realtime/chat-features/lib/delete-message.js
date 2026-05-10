import {} from "@chat/shared";
import { supabase } from "../../supabase/supabase.ts";
export async function deleteMessage(socket, msgToDelete, ack) {
    try {
        const { threadId, msgId, sender } = msgToDelete;
        // add ts-ignore if fails to compile
        if (!threadId || !msgId || !sender || (sender !== socket.profile.id)) {
            throw new Error("Delete not allowed!");
        }
        const { error: dbDeleteError } = await supabase.rpc("delete_message_for_user", {
            p_msg_id: msgId,
            p_sender_user_id: socket.profile.id,
        });
        if (dbDeleteError)
            throw new Error(dbDeleteError.message);
        // NOW EMIT message deleted so other clients can instantly see the changes: 
        socket.to(threadId).emit("message:deleted", threadId, msgId);
        return ack({ ok: true, data: "DELETE_SUCCESS" });
    }
    catch (err) {
        console.error("[deleteMessage] Failed to delete message from DB >> ", err instanceof Error ? err.message : "");
        return ack({ ok: false, data: "DELETE_FAIL" });
    }
}
//# sourceMappingURL=delete-message.js.map