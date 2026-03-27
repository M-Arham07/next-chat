import { Message } from '@chat/shared';

export type MessageState = {
  [threadId: string]: Message[];
};
