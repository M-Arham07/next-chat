import { ConnectDB, Messages, type Ack, type AckFN, type Message } from "@chat/shared";
import type { Socket } from "socket.io";
import type { TypedSocket } from "../../types.ts";





export const handleNewMessage = async (socket: TypedSocket, newMessage: Message, ack: AckFN): Promise<void> => {

    try {
        // VALIDATE VIA ZOD FIRST

        // FIRST INSERT TO DB, ONLY THEN EMIT MESSAGE (TO AVOID GHOST MESSAGES!)

        await ConnectDB();


        // SET NEW MESSAGE STATUS TO SENT (SO PROPERLY STORED IN DB)

        newMessage.status = "sent";
        
        await Messages.create(newMessage);



        // EMIT THE MESSAGES TO OTHERS IN THE THREAD THEN DO ACK TRUE ! 

        // TODO : VERIFY IF USER IS EVEN IN THE THREAD ID? 

        socket.to(newMessage.threadId).emit("message:received", newMessage);

        console.log(`Message from ${newMessage.sender} emitted to thread:${newMessage.threadId}`);


        ack({ ok: true, data: "SENT_OK" });
        return;






    }
    catch (err) {


        if (err instanceof Error) {
            console.error("[handleNewMessage] Failed to send message >>", err.message);
        }

        ack({ ok: false, data: "SEND_FAILED" });

        return;



    }




}