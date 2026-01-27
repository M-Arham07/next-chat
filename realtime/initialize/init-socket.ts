
import type { Server as NodeHttpServer } from "node:http";
import { Server } from "socket.io";
import { socketMiddleware } from "./socket-auth-middleware.ts";
import type { ClientToServerEvents, ServerToClientEvents } from "@chat/shared"
import {registerChatFeatures} from "../chat-features/feature-handler.ts";
import { joinAllRooms } from "../chat-features/join-all-rooms.ts";
  import { ConnectDB } from "@chat/shared";

export default function InitSocket(server: NodeHttpServer) {

    const ALLOWED_ORIGINS : string[] = process?.env?.ALLOWED_ORIGINS?.split(",") ?? [];
    


   

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
        cors: {
            origin: ALLOWED_ORIGINS, // tighten in production
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


        
        registerChatFeatures(io,socket);

      

        
        
        
        socket.on("disconnect", () => {
            console.log("disconnected:", socket.id);
        });





    });





}