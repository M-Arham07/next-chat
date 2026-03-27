import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@chat/shared";

export type SocketClientType = Socket<ServerToClientEvents, ClientToServerEvents>;

export const getSocket = (sessionToken: string): SocketClientType => {
  if (!sessionToken) throw new Error("No session token provided!");

  const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (!socketUrl) throw new Error("No socket url provided");

  const socket: SocketClientType = io(socketUrl, {
    auth: { sessionToken },
  });

  return socket;
};
