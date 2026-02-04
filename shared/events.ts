import type { Message } from "./types";

export type Ack = {
  ok: boolean;
  data: string;
};

export type AckFN = (res: Ack) => void;


// Group message-related events
export const MESSAGE_EVENTS = {
  NEW: "message:new",
  RECEIVED: "message:received",
  DELETE: "message:delete",
  DELETED: "message:deleted"
  // EDIT: "message:edit",
} as const;

// Group room-related events
export const ROOM_EVENTS = {
  JOIN: "room:join",
  LEAVE: "room:leave",
} as const;

// Unions
type MessageEvent = typeof MESSAGE_EVENTS[keyof typeof MESSAGE_EVENTS];
type RoomEvent = typeof ROOM_EVENTS[keyof typeof ROOM_EVENTS];

// Client -> Server (client will emit, and server will receive these events)
export type ClientToServerEvents = {
  [MESSAGE_EVENTS.NEW]: (message: Message, ack: AckFN) => void;
  [MESSAGE_EVENTS.RECEIVED]: (message: Message, ack: AckFN) => void;
  [MESSAGE_EVENTS.DELETE]: (msgToDelete: Message, ack: AckFN) => void;
} & {
  [K in RoomEvent]: (roomId: string, ack: AckFN) => void;
};

// Server -> Client emission
export type ServerToClientEvents = {
  [MESSAGE_EVENTS.NEW]: (message: Message) => void;
  [MESSAGE_EVENTS.RECEIVED]: (message: Message) => void;
  [MESSAGE_EVENTS.DELETED]: (threadId:string,msgId:string) => void;
};

