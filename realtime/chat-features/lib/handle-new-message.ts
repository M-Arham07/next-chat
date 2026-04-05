import { type AckFN, type Message } from "@chat/shared";
import { messageSchema } from "@chat/shared/schema/message.ts";
import type { TypedSocket } from "../../types.ts";
import { supabase } from "../../supabase/supabase.ts";
import { logger } from "../../lib/logger.ts";





export const handleNewMessage = async (socket: TypedSocket, newMessage: Message, ack: AckFN): Promise<void> => {

    try {
        // VALIDATE VIA ZOD FIRST
        messageSchema.parse(newMessage);


        // FIRST INSERT TO DB, ONLY THEN EMIT MESSAGE (TO AVOID GHOST MESSAGES!)



        // SET NEW MESSAGE STATUS TO SENT (SO PROPERLY STORED IN DB)

        newMessage.status = "sent";


      


        
        // IF USER ISNT IN THE THREAD,  database will reject the insert! 

        const { error: dbInsertError } = await supabase.from("messages").insert({
            msg_id: newMessage.msgId,
            type:newMessage.type,
            thread_id: newMessage.threadId,
            sender: newMessage.sender,
            content: newMessage.content,
            status: newMessage.status,
            timestamp: newMessage.timestamp
        });

        if(dbInsertError) throw new Error(dbInsertError.message)

        // EMIT THE MESSAGES TO OTHERS IN THE THREAD THEN DO ACK TRUE ! 


        socket.to(newMessage.threadId).emit("message:received", newMessage);

        logger.db(`Message from ${newMessage.sender} emitted to thread:${newMessage.threadId}`);


        ack({ ok: true, data: "SENT_OK" });
        return;






    }
    catch (err) {


        if (err instanceof Error) {
            logger.error("[handleNewMessage] Failed to send message >>", err.message);
        }

        ack({ ok: false, data: "SEND_FAILED" });

        return;



    }




}