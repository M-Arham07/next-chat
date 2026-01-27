import { Message } from "./types";

export type Ack = {
  ok: boolean;
  data: string;
};

// Group message-related events
export const MESSAGE_EVENTS = {
  NEW: "message:new",
  RECEIVED: "message:received",
  // EDIT: "message:edit",
  // DELETE: "message:delete",
} as const;

// Group room-related events
export const ROOM_EVENTS = {
  JOIN: "room:join",
  LEAVE: "room:leave",
} as const;


export type AckFN = (res: Ack) => void
// Unions
type MessageEvent = typeof MESSAGE_EVENTS[keyof typeof MESSAGE_EVENTS];
type RoomEvent = typeof ROOM_EVENTS[keyof typeof ROOM_EVENTS];

export type ClientToServerEvents = {
  [K in MessageEvent]: (message: Message, ack: AckFN) => void;
} & {
  [K in RoomEvent]: (roomId: string, ack: AckFN) => void;
};

export type ServerToClientEvents = {
  [K in MessageEvent]: (message: Message) => void;
};
