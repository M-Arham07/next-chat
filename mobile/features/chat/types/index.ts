import { Message } from "@shared/types";

export type NavTab = "threads" | "updates" | "communities" | "calls";

export type ActiveFilter = "all" | "unread" | "groups";

export type MessageState = {
  [threadId: string]: Message[];
};
