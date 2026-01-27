
import { User } from "@chat/shared";
import { ConnectDB } from "@chat/shared";
import { Threads } from "@chat/shared";

export async function getUserThreads(username: string): Promise<string[]> {



    try {

        await ConnectDB();

        // ONLY GET THREAD IDS!
        const threads = await Threads.find({
            "particpants.username": username
        });

        const threadIds = threads.map(thread => thread.threadId);

        if (!threadIds || threadIds.length === 0) {
            throw new Error("No thread found, aborting... ");
        }


        return threadIds;



    }
    catch (err) {

        if(err instanceof Error){
        console.error("[getUserThreads] Failed to get user threads! Logs: ", err?.message);
        }
        
        return [];


    }



}