import type { Socket } from "socket.io";
import { getUserThreads } from "./lib/getUserThreads.ts";


const joinAllRooms = async (socket : Socket): Promise<void> => {

    
    // GET ALL THREAD_IDS FOR THIS USER_ID
    const threadIds = await getUserThreads(socket.profile.id);

    socket.join(threadIds);
    console.log(`${socket.profile.username} joined threads:${threadIds}`);

    


}

export { joinAllRooms };