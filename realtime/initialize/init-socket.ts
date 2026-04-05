
import type { Server as NodeHttpServer } from "node:http";
import { Server } from "socket.io";
import { socketMiddleware } from "./socket-auth-middleware.ts";
import type { TypedIO } from "../types.ts";
import { joinAllRooms } from "../chat-features/join-all-rooms.ts";
import { registerChatFeatures } from "../chat-features/register-chat-features.ts";
import { logger } from "../lib/logger.ts";

export default function InitSocket(server: NodeHttpServer) {


    if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    ) {
        throw new Error("Missing environment variables");
    }


        const ALLOWED_ORIGINS: string[] = process?.env?.ALLOWED_ORIGINS?.split(",") ?? [];





    logger.info("Allowed origins: " + ALLOWED_ORIGINS.join(", "));
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
        logger.ws(`connected: ${socket.id}`);

        // JOIN ALL ROOMS UPON CONNECTION:


        await joinAllRooms(socket);



        registerChatFeatures(io, socket);






        socket.on("disconnect", () => {
            logger.ws(`disconnected: ${socket.id}`);
        });





    });





}