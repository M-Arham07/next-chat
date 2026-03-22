import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@chat/shared";

export type SocketClientType = Socket<ServerToClientEvents, ClientToServerEvents>;

export const getSocket = (sessionToken: string): SocketClientType => {
    if (!sessionToken) throw new Error("No session token provided!");

    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
    if (!socketUrl) throw new Error("No socket URL provided");

    const socket: SocketClientType = io(socketUrl, {
        auth: {
            sessionToken: sessionToken,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    return socket;
};
