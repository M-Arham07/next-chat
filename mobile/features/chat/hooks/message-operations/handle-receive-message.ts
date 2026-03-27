import { RefObject } from 'react';
import { Message } from '@chat/shared';
import { messageSchema } from '@chat/shared/schema';
import { Profile } from '@chat/shared/schema/profiles/profile';

export const handleReceiveMessage = (
  receivedMsg: Message,
  profileRef: RefObject<Profile | null>,
  addMessages: (msgs: Message[]) => void
): void => {
  console.log('received a message');

  // Parse with Zod
  const parsed = messageSchema.safeParse(receivedMsg);

  if (!parsed.success) {
    console.log('Invalid message received');
    return;
  }

  const isEcho = receivedMsg.sender === profileRef.current?.id;

  console.log(`Received a message from ${receivedMsg.sender}! isEcho ${isEcho}`);

  // Messages already sorted from backend
  addMessages([receivedMsg]);

  return;
};
