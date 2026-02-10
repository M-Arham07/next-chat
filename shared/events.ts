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
  DELETED: "message:deleted",
  // EDIT: "message:edit",
} as const;

// Group room-related events
export const ROOM_EVENTS = {
  JOIN: "room:join",
  LEAVE: "room:leave",
} as const;

// Group typing-related events
export const TYPING_EVENTS = {
  START: "typing:start",
  STOP: "typing:stop",
} as const;

// Unions
type RoomEvent = typeof ROOM_EVENTS[keyof typeof ROOM_EVENTS];

// Client -> Server (client emits, server receives)
export type ClientToServerEvents = {
  [MESSAGE_EVENTS.NEW]: (message: Message, ack: AckFN) => void;
  [MESSAGE_EVENTS.RECEIVED]: (message: Message, ack: AckFN) => void;
  [MESSAGE_EVENTS.DELETE]: (msgToDelete: Message, ack: AckFN) => void;

  [TYPING_EVENTS.START]: (threadId: string, username: string) => void;
  [TYPING_EVENTS.STOP]: (threadId: string, username: string) => void;
} & {
  [K in RoomEvent]: (threadId: string, ack: AckFN) => void;
};

// Server -> Client (server emits, client receives)
export type ServerToClientEvents = {
  [MESSAGE_EVENTS.NEW]: (message: Message) => void;
  [MESSAGE_EVENTS.RECEIVED]: (message: Message) => void;
  [MESSAGE_EVENTS.DELETED]: (threadId: string, msgId: string) => void;

  [TYPING_EVENTS.START]: (threadId: string, username: string) => void;
  [TYPING_EVENTS.STOP]: (threadId: string, username: string) => void;
};
