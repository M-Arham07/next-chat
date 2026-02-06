
import type { Server as NodeHttpServer } from "node:http";
import { Server } from "socket.io";
import { socketMiddleware } from "./socket-auth-middleware.ts";
import { registerChatFeatures } from "../chat-features/register-chat-features.ts";
import { joinAllRooms } from "../chat-features/join-all-rooms.ts";
import type { TypedIO } from "../types.ts";

export default function InitSocket(server: NodeHttpServer) {


    const ALLOWED_ORIGINS: string[] = process?.env?.ALLOWED_ORIGINS?.split(",") ?? [];


   





    console.log(ALLOWED_ORIGINS)
    const io = new Server<TypedIO>(server, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? ALLOWED_ORIGINS : "*", 
            methods: ["GET", "POST"],
            credentials: true
        }
    });


    // pass the middleware reference!

    io.use(socketMiddleware);



    io.on("connection", async (socket) => {
        console.log("connected:", socket.id);

        // JOIN ALL ROOMS UPON CONNECTION:


        await joinAllRooms(socket);



        registerChatFeatures(io, socket);






        socket.on("disconnect", () => {
            console.log("disconnected:", socket.id);
        });





    });





}