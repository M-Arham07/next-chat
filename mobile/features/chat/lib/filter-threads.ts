import { Thread } from "@chat/shared";
import { ActiveFilter } from "../types";
import { MessageState } from "../types/message-state";
import { Profile } from "@chat/shared/schema/profiles/profile";

const filterThreads = (
  threads: Thread[] | null,
  messages: MessageState | null,
  profile: Profile | null,
  searchQuery: string,
  activeFilter: ActiveFilter
): Thread[] | null => {
  if (!searchQuery.trim()) return threads;

  let result: Thread[] = [...(threads ?? [])];
  const query: string = searchQuery.toLowerCase();

  result = result.filter((thread) => {
    const matchesMsgs = messages?.[thread.threadId]?.some((msg) =>
      msg.content.toLowerCase().includes(query)
    );

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
      thread.type === "group" &&
      thread.groupName!.toLowerCase().includes(query)
    ) {
      matchesName = true;
    }

    return matchesMsgs || matchesName;
  });

  return result;
};

export default filterThreads;
