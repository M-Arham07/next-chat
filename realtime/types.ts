import type { ClientToServerEvents, ServerToClientEvents } from "@chat/shared";
import type { Server,Socket } from "socket.io";


export type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
