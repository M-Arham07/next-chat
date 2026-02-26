"use client";
import { CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { Message, Thread, particpant } from "@chat/shared";
import { formatTime } from "@/lib/format-time";



const avatarColors = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
];


// this component will receive the individual thread object ! 
const ThreadItem = ({ thread }: { thread: Thread}) => {
  // Deterministic color based on id
  const colorClass = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const { data: session } = useSession();
  const { messages, typingUsers } = useChatApp()!;

  
  const lastUsernameTypingIdx = (typingUsers?.[thread.threadId]?.size ?? 0) - 1;  
  const currentlyTypingUsername = [...(typingUsers?.[thread.threadId] ?? [])][lastUsernameTypingIdx]

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
        <Avatar className="w-12 h-12 shrink-0 ring-1 ring-border/50">

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
            <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">
              {formatTime(lastMessage?.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">

            {/** WILL BE REPLACED BY READBY.INCLUDES! */}
            {false &&
              <CheckCheck className="w-4 h-4 shrink-0 text-success" />
            }

            <p className="text-sm text-muted-foreground truncate flex-1">


              {currentlyTypingUsername ? `${currentlyTypingUsername} is typing...`
               : lastMessage?.type === "text"
                ? lastMessage.content.slice(0, 30) + "..."
                : `${lastMessage?.type} message`}
            </p>
          </div>

        </div>
      </motion.div>
    </Link>
  );
};

export default ThreadItem;