import { Message } from "./types";

// shared/events.ts
export const EVENTS = {
  MESSAGE: "message:new",
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
} as const;

export type ClientToServerEvents = {
  [EVENTS.MESSAGE]: (message: Message) => void;
  [EVENTS.JOIN_ROOM]: (roomId: string) => void;
  [EVENTS.LEAVE_ROOM]: (roomId: string) => void;
};

export type ServerToClientEvents = {
  [EVENTS.MESSAGE]: (message : Message) => void;
};
