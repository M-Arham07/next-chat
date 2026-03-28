import { Thread, Message } from "@shared/types";
import { MessageState, ActiveFilter } from "../types";

export function filterThreads(
  threads: Thread[] | null,
  messages: MessageState | null,
  user: any,
  searchQuery: string,
  activeFilter: ActiveFilter
): Thread[] | null {
  if (!threads) return null;

  let filtered = [...threads];

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((thread) => {
      // Search in group name
      if (thread.groupName?.toLowerCase().includes(query)) return true;

      // Search in participant usernames
      if (
        thread.particpants.some((p) =>
          p.username.toLowerCase().includes(query)
        )
      )
        return true;

      // Search in messages content
      const threadMessages = messages?.[thread.threadId] || [];
      if (
        threadMessages.some(
          (m) =>
            m.type === "text" && m.content.toLowerCase().includes(query)
        )
      )
        return true;

      return false;
    });
  }

  // Filter by active filter
  switch (activeFilter) {
    case "unread":
      // Placeholder: In a real app, you'd check for unread messages
      filtered = filtered.filter((thread) => {
        const threadMessages = messages?.[thread.threadId] || [];
        // Check if last message is not from current user
        const lastMsg = threadMessages[threadMessages.length - 1];
        return lastMsg && lastMsg.sender !== user?.email;
      });
      break;

    case "groups":
      filtered = filtered.filter((thread) => thread.type === "group");
      break;

    case "all":
    default:
      // No additional filtering
      break;
  }

  // Sort by most recent activity
  filtered.sort((a, b) => {
    const aLastMsg = messages?.[a.threadId]?.slice(-1)[0];
    const bLastMsg = messages?.[b.threadId]?.slice(-1)[0];

    const aTime = aLastMsg?.timestamp
      ? new Date(aLastMsg.timestamp).getTime()
      : new Date(a.createdAt).getTime();
    const bTime = bLastMsg?.timestamp
      ? new Date(bLastMsg.timestamp).getTime()
      : new Date(b.createdAt).getTime();

    return bTime - aTime;
  });

  return filtered;
}
