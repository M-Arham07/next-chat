import { Thread } from "@chat/shared";
import { ActiveFilter, MessageState } from "../types";

const filterThreads = (
  threads: Thread[] | null,
  messages: MessageState | null,
  session: any | null,
  searchQuery: string,
  activeFilter: ActiveFilter
): Thread[] | null => {
  if (!searchQuery.trim()) return threads;

  let result: Thread[] = [...(threads ?? [])];
  const query: string = searchQuery.toLowerCase();

  result = result.filter(thread => {
    const matchesMsgs = messages?.[thread.threadId]?.some(msg => 
      msg.content.toLowerCase().includes(query)
    );

    let matchesName = false;
    
    // EXCLUDE the logged in user's username
    if (thread.particpants.some(p => p.username.toLowerCase().includes(query) && session?.user?.username && p.username.toLowerCase() !== session.user.username.toLowerCase())) {
      matchesName = true;
    } else if (thread.type === "group" && thread.groupName?.toLowerCase().includes(query)) {
      matchesName = true;
    }

    return matchesMsgs || matchesName;
  });

  return result;
};

export default filterThreads;
