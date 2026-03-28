import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });
  }
  return socket;
}

export function connectSocket(userId: string): void {
  const socket = getSocket();
  
  if (!socket.connected) {
    socket.auth = { userId };
    socket.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function emitMessage(event: string, data: any): void {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit(event, data);
  }
}

export function onMessage(event: string, callback: (data: any) => void): void {
  const socket = getSocket();
  socket.on(event, callback);
}

export function offMessage(event: string, callback?: (data: any) => void): void {
  const socket = getSocket();
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
}
