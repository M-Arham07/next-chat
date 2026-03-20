import { type AckFN, type Message } from "@chat/shared";
import type { TypedSocket } from "../../types.ts";
import { supabase } from "../../supabase/supabase.ts";




export async function deleteMessage(socket: TypedSocket, msgToDelete: Message, ack: AckFN): Promise<void> {





    try {



        const { threadId, msgId, sender } = msgToDelete;




        // add ts-ignore if fails to compile

        if (!threadId || !msgId || !sender || (sender !== socket.profile.username)) {
            throw new Error("Delete not allowed!");
        }




        const { error: dbDeleteError } = await supabase.from("messages").delete().eq("msgId", msgId);

        if (dbDeleteError) throw new Error(dbDeleteError.message);




        // NOW EMIT message deleted so other clients can instantly see the changes: 


        socket.to(threadId).emit("message:deleted", threadId, msgId);


        return ack({ ok: true, data: "DELETE_SUCCESS" });


    }


    catch (err) {

        console.error("[deleteMessage] Failed to delete message from DB >> ", err instanceof Error ? err.message : "");
        return ack({ ok: false, data: "DELETE_FAIL" });


    }

}