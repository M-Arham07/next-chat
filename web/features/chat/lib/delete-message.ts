"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ConnectDB, Messages } from "@chat/shared";
import { getServerSession } from "next-auth";


export async function deleteMessage(threadId: string, msgId: string, sender: string): Promise<boolean> {

    const session = await getServerSession(authOptions);



    if(!threadId || !msgId || !sender || (sender !== session?.user?.email)) return false;


    try {

        if (msgId)

            await ConnectDB();

        await Messages.findOneAndUpdate(
            { msgId: msgId },
            {
                $set:{
                    content:"",
                    type:"deleted",
                    replyToMsgId:null,
                    readBy:[]
                }
            }

        );

        return true;

    }

    
    catch (err) {


        console.error("[deleteMessage] Failed to delete message from DB >> ", err instanceof Error ? err.message : "");
        return false;

    }

}