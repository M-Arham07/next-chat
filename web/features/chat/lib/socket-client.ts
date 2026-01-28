"use client";

import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@chat/shared";


export type SocketClientType = Socket<ServerToClientEvents, ClientToServerEvents>

export const getSocket = (sessionToken: string) : SocketClientType => {
    
    if(!sessionToken) throw new Error("No session token provided !");

    if(!process.env.NEXT_PUBLIC_SOCKET_URL) throw new Error("No socket url provided");


    const socket: SocketClientType = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        auth: {
            sessionToken: sessionToken
        }
    });

    return socket;
} 