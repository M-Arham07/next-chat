import { Thread } from '@chat/shared';
import { ActiveFilter } from '../types';
import { MessageState } from '../types/message-state';
import { Profile } from '@chat/shared/schema/profiles/profile';

const filterThreads = (
  threads: Thread[] | null,
  messages: MessageState | null,
  profile: Profile | null,
  searchQuery: string,
  activeFilter: ActiveFilter
): Thread[] | null => {
  if (!threads) return null;

  let result: Thread[] = [...threads];

  // Apply filter
  if (activeFilter === 'groups') {
    result = result.filter((thread) => thread.type === 'group');
  } else if (activeFilter === 'unread') {
    // Filter for unread messages - simplified logic
    result = result.filter((thread) => {
      const lastMessage =
        messages?.[thread.threadId]?.[
          (messages[thread.threadId]?.length ?? 0) - 1
        ];
      return lastMessage && lastMessage.status !== 'sent';
    });
  }

  // Apply search
  if (!searchQuery.trim()) return result;

  const query: string = searchQuery.toLowerCase();

  result = result.filter((thread) => {
    // Query matches messages in this thread?
    const matchesMsgs = messages?.[thread.threadId]?.some((msg) =>
      msg.content.toLowerCase().includes(query)
    );

    // Query matches participant names or group name?
    let matchesName = false;

    if (
      thread.participants.some(
        (p) =>
          p.username.toLowerCase().includes(query) &&
          p.username !== profile?.username?.toLowerCase()
      )
    ) {
      matchesName = true;
    } else if (
      thread.type === 'group' &&
      thread.groupName?.toLowerCase().includes(query)
    ) {
      matchesName = true;
    }

    return matchesMsgs || matchesName;
  });

  return result;
};

export default filterThreads;
