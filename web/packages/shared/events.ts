import { Message } from "./types";

type Ack = {
  ok: boolean;
  data: string;
};

// Group all message-related events here
export const MESSAGE_EVENTS = {
  NEW: "message:new",
  RECEIVED:"message:received"
  // EDIT: "message:edit",
  // DELETE: "message:delete",
} as const;

// Runtime array of all message events
export const MESSAGE = Object.values(MESSAGE_EVENTS);

// Other events
export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
} as const;

type MessageEvent = typeof MESSAGE_EVENTS[keyof typeof MESSAGE_EVENTS];

export type ClientToServerEvents = {
  [K in MessageEvent]: (message: Message, ack: (res: Ack) => void) => void;
} & {
  [EVENTS.JOIN_ROOM]: (roomId: string, ack: (res: Ack) => void) => void;
  [EVENTS.LEAVE_ROOM]: (roomId: string, ack: (res: Ack) => void) => void;
};

export type ServerToClientEvents = {
  [K in MessageEvent]: (message: Message) => void;
};
