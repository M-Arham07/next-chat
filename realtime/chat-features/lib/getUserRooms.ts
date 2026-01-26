
import { User } from "@chat/shared";
import { ConnectDB } from "@chat/shared";
import { Threads } from "@chat/shared";

export async function getUserRooms(username: string): Promise<string[]> {


    try {

        await ConnectDB();
        const threads = await Threads.findOne({
            "particpant.username": username
        });

        console.log("threads are",threads);


         



    }
    catch (err) {

    }


}