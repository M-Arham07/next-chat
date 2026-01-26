import type { Server, Socket } from "socket.io";
import { joinAllRooms } from "./join-all-rooms.ts";


export default function ChatFeaturesHandler(io: Server, socket: Socket) {



    // JOIN ALL ROOMS: 

    socket.on("connect", joinAllRooms);





}