
import { User } from "@chat/shared";
import { ConnectDB } from "@chat/shared";
import { Threads } from "@chat/shared";

export async function getUserRooms(username: string): Promise<string[]> {


    try {

        await ConnectDB();
        const threads : string[] | null = await Threads.findOne({
            "particpant.username": username
        });

        if (!threads || threads?.length === 0) {
            throw new Error("No rooms found, aborting... ");
        }


        return threads;



    }
    catch (err) {

        console.log("[getUserRooms] Failed to get user rooms! Logs: ",err?.message);

        return [];


    }



}