"use client";
import { CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { particpant, Thread } from "@/packages/shared/types/threads";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { Message } from "@/packages/shared/types";



// export interface ThreadItemProps {
//   id: number;
//   name: string;
//   lastMessage: string;
//   timestamp: string;
//   avatar?: string;
//   initial?: string;
//   avatarColor?: string;
//   hasBlueCheck?: boolean;
//   isGroup?: boolean;
//   isSelected?: boolean;
//   onClick?: () => void;
// }

const avatarColors = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
];


// this component will receive the individual thread object ! 
const ThreadItem = ({ thread }: { thread: Thread }) => {
  // Deterministic color based on id
  const colorClass = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const { data: session } = useSession();
  const { messages } = useChatApp()!;

  // get last message of this thread : 


  const msgsLength = messages?.[thread.threadId]?.length ?? -1;

  const lastMessage: Message | undefined = messages?.[thread.threadId]?.[msgsLength - 1];

  


  // IF THREAD TYPE IS DIRECT:
  let otherParticipant: particpant | undefined = undefined;

  if (thread.type === "direct") {
    otherParticipant = thread.particpants?.find(p => p.username.toLowerCase() !== session?.user.username!.toLowerCase());
  }






  return (
    <Link href={`/chat/${thread.threadId}`}>

      <motion.div                                                                                                            // need to put isSelected, or remove this
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 group ${false ? 'selected bg-accent' : ''}`}
        // onClick={onClick}
        whileHover={{ backgroundColor: "hsl(0 0% 12%)" }}
        whileTap={{ scale: 0.970 }}
        transition={{ duration: 0.15 }}
      >
        <Avatar className="w-12 h-12 flex-shrink-0 ring-1 ring-border/50">

          <AvatarImage src={thread.groupImage ||
            otherParticipant?.image
            || ""
          } alt={thread.groupName || ""} className="object-cover" />

          <AvatarFallback className={`${colorClass} text-foreground text-base font-medium`}>
            {(thread?.groupImage || otherParticipant?.username)!.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 py-1 border-b border-border/30">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[15px] text-foreground truncate">
              {
                /* If thread.groupName exists, then show the group name 
                 Otherwise, its a private dm so show the other participant's username ! 
                 (use "Unknown" as a fallback)
                */
                thread.groupName || otherParticipant?.username || "Unknown"
              }
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-mono">
              {"Loading"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">

            {/* WILL MODIFY LATER! */}
            {true && (
              <CheckCheck className="w-4 h-4 flex-shrink-0 text-success" color="#09ebd8" />
            )}
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage?.content}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ThreadItem;