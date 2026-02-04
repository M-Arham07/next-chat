import { ConnectDB, Messages, type AckFN, type Message } from "@chat/shared";
import type { TypedSocket } from "../../types.ts";
import type { Model } from "mongoose";




export async function deleteMessage(socket: TypedSocket, msgToDelete: Message, ack: AckFN): Promise<void> {





    try {



        const { threadId, msgId, sender } = msgToDelete;


        if (!threadId || !msgId || !sender || (sender !== socket.username)) {
            throw new Error("Delete not allowed!");
        }

        await ConnectDB();


        await (Messages as Model<Message>).findOneAndUpdate(
            { msgId: msgId },
            {
                $set: {
                    content: "",
                    type: "deleted",
                    replyToMsgId: null,
                    readBy: []
                }
            }

        );




        // NOW EMIT message deleted so other clients can instantly see the changes: 


        socket.to(threadId).emit("message:deleted", threadId, msgId);

    
        return ack({ ok: true, data: "DELETE_SUCCESS" });


    }


    catch (err) {

        console.error("[deleteMessage] Failed to delete message from DB >> ", err instanceof Error ? err.message : "");
        return ack({ ok: false, data: "DELETE_FAIL" });


    }

}