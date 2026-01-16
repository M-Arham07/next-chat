"use client"
import { useState, useMemo } from "react";

import { ComingSoon } from "./_components/shared";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/lib/use-mobile";
import { motion, AnimatePresence } from "framer-motion";




import ThreadFilterTabs from "./_components/ThreadFilterTabs";
import ThreadHeader from "./_components/ThreadHeader";
import ThreadList from "./_components/ThreadList"
import BottomNavigation, { NavTab } from "./_components/layout/BottomNavigation";
import DesktopSidebar from "./_components/layout/DesktopSidebar";
import FloatingActionButton from "./_components/FloatingActionButton";
import { Thread } from "@/packages/shared/types/threads";
import { useMessages } from "@/features/chat/hooks/use-messages";
import { useSession } from "next-auth/react";








export const mockThreads: Thread[] = [
  {
    threadId: "t1",
    type: "direct",
    createdAt: new Date("2023-10-01T10:00:00Z"),
    particpants: [
      {
        username: "alex_smith",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        role: "member"
      },
      {
        username: "jordan_lee",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
        role: "member"
      }
    ]
  },
  {
    threadId: "t2",
    type: "group",
    groupName: "Project Phoenix 🔥",
    groupImage: "https://api.dicebear.com/7.x/initials/svg?seed=PP",
    createdBy: "admin_sarah",
    createdAt: new Date("2023-11-15T09:30:00Z"),
    particpants: [
      {
        username: "admin_sarah",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        role: "admin",
        joinedAt: new Date("2023-11-15T09:30:00Z")
      },
      {
        username: "dev_mike",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        role: "member",
        joinedAt: new Date("2023-11-16T14:20:00Z")
      },
      {
        username: "designer_rose",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rose",
        role: "member",
        joinedAt: new Date("2023-11-15T10:00:00Z"),
        leftAt: new Date("2023-12-01T12:00:00Z")
      }
    ]
  },
  {
    threadId: "t3",
    type: "direct",
    createdAt: new Date("2024-01-05T18:45:00Z"),
    particpants: [
      {
        username: "support_bot",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=Support",
        role: "member"
      },
      {
        username: "jordan_lee",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
        role: "member"
      }
    ]
  },
  {
    threadId: "t4",
    type: "group",
    groupName: "Friday Lunch Crew",
    groupImage: "https://api.dicebear.com/7.x/initials/svg?seed=FLC",
    createdBy: "foodie_phil",
    createdAt: new Date("2024-01-10T11:00:00Z"),
    particpants: [
      {
        username: "foodie_phil",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Phil",
        role: "admin",
        joinedAt: new Date("2024-01-10T11:00:00Z")
      },
      {
        username: "alex_smith",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        role: "member",
        joinedAt: new Date("2024-01-10T11:05:00Z")
      }
    ]
  }
];









const Index = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<NavTab>("threads");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();

  const { data: session } = useSession();

  const [threads, setThreads] = useState<Thread[]>(mockThreads);

  // TODO: FETCH 10 messages for each thread on initial load ?

  const messages = useMessages();

  console.log("messages are:",messages)


  // Filter threads based on search query and active filter
  const filteredThreads = useMemo(() => {
    let result: Thread[] = [...threads];

    // filter logic

    if (searchQuery.trim()) {

      const query: string = searchQuery.toLowerCase();



      result = result.filter(thread => {

        // query matches atleast one of the messages in this thread?
        const matchesMsgs = messages![thread.threadId]?.some(msg => msg.content.toLowerCase().includes(query));

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



    }





    console.log("filtered is",result);

    return result;


  }, [searchQuery, activeFilter, threads]);



  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-[calc(72px+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "threads" ? (
            <motion.div
              key="threads"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ThreadHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <ThreadList
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onThreadSelect={setSelectedThreadId}
                className="h-[calc(100vh-200px)]"
              />

              {/* ✅ FAB lifted above BottomNavigation */}
              <div className="fixed right-1 bottom-[calc(72px+env(safe-area-inset-bottom)+16px)] z-50">
                <FloatingActionButton />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              className="h-[calc(100vh-100px)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ComingSoon title={activeTab} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom nav is already fixed */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }


  return (
    <motion.div
      className="h-screen bg-background flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full min-h-0 flex flex-col border-r border-border/30 bg-card/50">
            <AnimatePresence mode="wait">
              {activeTab === "threads" ? (
                <motion.div
                  key="threads-panel"
                  className="flex flex-col h-full min-h-0 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ThreadHeader
                    isDesktop
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                  <ThreadFilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />

                  {/* ✅ scrollable region */}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <ThreadList
                      threads={filteredThreads}
                      selectedThreadId={selectedThreadId}
                      onThreadSelect={setSelectedThreadId}
                      className="h-full"
                    />
                  </div>

                  <FloatingActionButton />
                </motion.div>
              ) : (
                <motion.div
                  key={`${activeTab}-panel`}
                  className="h-full min-h-0 overflow-y-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ComingSoon title={activeTab} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-px bg-border/50 hover:bg-foreground/20 transition-colors data-[resize-handle-active]:bg-foreground/30" />

        <ResizablePanel defaultSize={65}>
          <motion.div
            className="h-full min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <ComingSoon />
          </motion.div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </motion.div>
  );
};

export default Index;