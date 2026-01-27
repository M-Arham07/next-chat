import type { Socket } from "socket.io";
import { getUserRooms } from "./lib/getUserRooms.ts";


const joinAllRooms = async (socket : Socket): Promise<void> => {

    
    // GET ALL ROOMS_IDS FOR THIS USER_ID
    const roomIds = await getUserRooms(socket.username);

    socket.join(roomIds);
    



}

export { joinAllRooms };