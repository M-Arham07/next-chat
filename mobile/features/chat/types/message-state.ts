import { Message } from "@chat/shared";

// maps a threadId to its array of messages!
export type MessageState = Record<string, Message[]>;
