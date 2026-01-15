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
import { ThreadItemProps } from "./_components/ThreadItem";








export const mockThreads: ThreadItemProps[] = [
  {
    id: 1,
    name: "+92 303 9472393",
    lastMessage: "fast net Hoga tab hi kaam Hoga",
    timestamp: "1/6/26",
    avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=100&h=100&fit=crop&crop=face",
    hasBlueCheck: true,
  },
  {
    id: 2,
    name: "Salah Sheikh",
    lastMessage: 'Salah reacted 👍 to "kabi Kiya ni aisa"',
    timestamp: "1/6/26",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Haider",
    lastMessage: "Let's see",
    timestamp: "1/6/26",
    initial: "H",
  },
  {
    id: 4,
    name: "+92 300 7947716",
    lastMessage: "It is online classes. While may be waiting...",
    timestamp: "1/6/26",
    initial: "M",
  },
  {
    id: 5,
    name: "Ramzan Event",
    lastMessage: "+92 330 4009973: Mausi",
    timestamp: "1/5/26",
    avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop",
    isGroup: true,
  },
  {
    id: 6,
    name: "+92 328 4198908",
    lastMessage: "Ok",
    timestamp: "1/3/26",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 7,
    name: "+212 715-912012",
    lastMessage: 'You reacted ❤️ to "📷 File System: (F2FS)..."',
    timestamp: "12/26",
    initial: "A",
  },
  {
    id: 8,
    name: "Fahad Kdm",
    lastMessage: "theek hai bro",
    timestamp: "12/25",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 9,
    name: "Ali Khan",
    lastMessage: "See you tomorrow!",
    timestamp: "1/2/26",
    initial: "A",
  },
  {
    id: 10,
    name: "Tech Group",
    lastMessage: "New update available",
    timestamp: "1/1/26",
    initial: "T",
    isGroup: true,
  },
  {
    id: 11,
    name: "Family Group",
    lastMessage: "Mom: Dinner is ready",
    timestamp: "12/31",
    initial: "F",
    isGroup: true,
  },
];

const Index = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<NavTab>("threads");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<number | undefined>();

  // Filter threads based on search query and active filter
  const filteredThreads = useMemo(() => {
    let result = mockThreads;

    // Search filter (by name or number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (thread) =>
          thread.name.toLowerCase().includes(query) ||
          thread.lastMessage.toLowerCase().includes(query)
      );
    }

    // Tab filter
    if (activeFilter === "unread") {
      result = result.filter((thread) => thread.id <= 4); // Mock unread
    } else if (activeFilter === "groups") {
      result = result.filter((thread) => thread.isGroup);
    }

 
    return result;
  }, [searchQuery, activeFilter]);

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