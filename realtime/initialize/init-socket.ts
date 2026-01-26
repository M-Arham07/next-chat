
import type { Server as NodeHttpServer } from "node:http";
import { Server } from "socket.io";
import { socketMiddleware } from "./socket-auth-middleware.ts";
import type { ClientToServerEvents, ServerToClientEvents } from "#/packages/shared/events.ts"

export default function InitSocket(server: NodeHttpServer) {
    


    const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
        cors: {
            origin: "http://localhost:3000", // tighten in production
            methods: ["GET", "POST"],
            credentials: true
        }
    });


    // pass the middleware reference!

    io.use(socketMiddleware);


    io.on("connection", (socket) => {
        console.log("connected:", socket.id);


        

        
        
        socket.on("disconnect", () => {
            console.log("disconnected:", socket.id);
        });





    });





}