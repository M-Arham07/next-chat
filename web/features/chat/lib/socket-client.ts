"use client";

import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents,ServerToClientEvents } from "@/packages/shared/events";



export const socket : Socket<ServerToClientEvents, ClientToServerEvents> = io(process.env.NEXT_PUBLIC_SOCKET_URL!,{
    withCredentials:true
});