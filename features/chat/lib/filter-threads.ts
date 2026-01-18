import { Thread } from "@/packages/shared/types/threads";
import { ActiveFilter } from "../types";
import { MessageState } from "../types/message-state";
import { Session } from "next-auth";


const filterThreads = (threads: Thread[] | null, messages: MessageState | null, session: Session | null,
  searchQuery: string, activeFilter: ActiveFilter): Thread[] | null => {

  if (!searchQuery.trim()) return threads;


  let result: Thread[] = [...(threads ?? [])]; // copy of the original threads array ! 


  const query: string = searchQuery.toLowerCase();

  result = result.filter(thread => {

    // query matches atleast one of the messages in this thread?
    const matchesMsgs = messages?.[thread.threadId]?.some(msg => msg.content.toLowerCase().includes(query));

    // does the query match the partcipants name or group name? (in case of GC )

    // EXCLUDE the loggined user's username while searching in particpants username!
    let matchesName = false;


    if (thread.particpants.some(p => p.username.toLowerCase().includes(query) && p.username !== session!.user.username!.toLowerCase())) {
      matchesName = true;

    }
    else if (thread.type === "group" && thread.groupName!.toLowerCase().includes(query)) {
      matchesName = true;
    }

    return matchesMsgs || matchesName;


  });


  return result;






}

export default filterThreads;