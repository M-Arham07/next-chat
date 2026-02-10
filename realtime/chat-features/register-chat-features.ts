import type { Server, Socket } from "socket.io";
import { joinAllRooms } from "./join-all-rooms.ts";
import { handleNewMessage } from "./lib/handle-new-message.ts";
import type { Ack, Message } from "#/shared/index.ts";
import type { TypedIO, TypedSocket } from "../types.ts";
import { deleteMessage } from "./lib/delete-message.ts";
import { handleTypingStart, handleTypingStop } from "./handle-typing.ts";


export function registerChatFeatures(io: TypedIO, socket: TypedSocket) {

    socket.on("message:new", async (newMessage, ack) => {
        handleNewMessage(socket, newMessage, ack);
    });


    socket.on("message:delete", (msgToDelete, ack) => {

        console.log("received message to delete:", msgToDelete);

        deleteMessage(socket, msgToDelete, ack);

    });


    // Realtime typing indicator: 
    socket.on("typing:start", (threadId, username) => handleTypingStart(socket, threadId, username));
    socket.on("typing:stop", (threadId, username) => handleTypingStop(socket, threadId, username));










}