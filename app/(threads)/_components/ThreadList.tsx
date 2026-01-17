"use client";
import ThreadItem from "./ThreadItem";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Thread } from "@/packages/shared/types/threads";
import { motion, AnimatePresence } from "framer-motion";

interface ThreadListProps {
  threads: Thread[] | null
  selectedThreadId?: string;
  onThreadSelect?: (id: string) => void;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const ThreadList = ({ threads, selectedThreadId, onThreadSelect, className }: ThreadListProps) => {

  console.log(threads)
  if (!threads || threads?.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-muted-foreground text-sm">No conversations found</p>
      </motion.div>
    );
  }

  return (
    <ScrollArea className={className}>
      <motion.div
        className="pb-4"
        variants={container}
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {threads.map((thread) => (
            <motion.div
              key={thread.threadId}
              variants={item}
              layout
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ThreadItem
                thread={thread}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </ScrollArea>
  );
};

export default ThreadList;