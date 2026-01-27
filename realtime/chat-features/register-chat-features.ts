import type { Server, Socket } from "socket.io";
import { joinAllRooms } from "./join-all-rooms.ts";
import { handleNewMessage } from "./lib/handle-new-message.ts";
import type { Ack, Message } from "#/shared/index.ts";
import type { TypedIO, TypedSocket } from "../types.ts";


export function registerChatFeatures(io: TypedIO, socket: TypedSocket) {
    


    socket.on("message:new",async (newMessage,ack)=>{
        await handleNewMessage(socket,newMessage,ack);
    }) 










}