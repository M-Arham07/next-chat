import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function initializeSocket(token: string): Socket {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
  });

  socket.on("error", (error) => {
    console.error("[Socket] Error:", error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Event listeners for real-time chat
export function onNewMessage(callback: (message: any) => void) {
  if (socket) {
    socket.on("message:new", callback);
  }
}

export function onMessageRead(callback: (data: any) => void) {
  if (socket) {
    socket.on("message:read", callback);
  }
}

export function onTypingIndicator(callback: (data: any) => void) {
  if (socket) {
    socket.on("user:typing", callback);
  }
}

// Emit events
export function emitMessage(threadId: string, content: string, mediaType?: string) {
  if (socket) {
    socket.emit("message:send", {
      threadId,
      content,
      mediaType,
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitTyping(threadId: string, isTyping: boolean) {
  if (socket) {
    socket.emit("user:typing", {
      threadId,
      isTyping,
    });
  }
}

export function emitMessageRead(messageId: string) {
  if (socket) {
    socket.emit("message:read", { messageId });
  }
}
