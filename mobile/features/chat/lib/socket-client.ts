import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@chat/shared';
import { getSocketUrl } from '@/lib/api-client';

export type SocketClientType = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

let socketInstance: SocketClientType | null = null;

export const getSocket = (sessionToken: string): SocketClientType => {
  if (!sessionToken) throw new Error('No session token provided!');

  const socketUrl = getSocketUrl();

  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      auth: {
        sessionToken: sessionToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
