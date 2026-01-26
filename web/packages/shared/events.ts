import { Message } from "./types";

type Ack = {
  ok: boolean;
  data: string;
};

export const EVENTS = {
  MESSAGE: "message:new",
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
} as const;

export type ClientToServerEvents = {
  [EVENTS.MESSAGE]: (message: Message, ack: (res: Ack) => void) => void;
  [EVENTS.JOIN_ROOM]: (roomId: string, ack: (res: Ack) => void) => void;
  [EVENTS.LEAVE_ROOM]: (roomId: string, ack: (res: Ack) => void) => void;
};

export type ServerToClientEvents = {
  [EVENTS.MESSAGE]: (message: Message) => void;
};
