"use client"
import { ComingSoon } from "../_components/shared";
import { motion, AnimatePresence } from "framer-motion";
import ThreadHeader from "../_components/ThreadHeader";
import ThreadList from "../_components/ThreadList"
import BottomNavigation, { NavTab } from "../_components/layout/BottomNavigation";
import FloatingActionButton from "../_components/FloatingActionButton";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";







export default function MobileThreadPage() {

  const { activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredThreads,
    selectedThreadId,
    setSelectedThreadId,
  } = useChatApp()!;

 







  return (
    <>
      {/* ================= MOBILE LAYOUT ================= */}
      <div className="md:hidden h-screen bg-background max-w-md mx-auto relative overflow-hidden pb-[calc(72px+env(safe-area-inset-bottom))]">
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

              {/* FAB */}
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

        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>


    </>
  );

      {/* ================= DESKTOP LAYOUT =================
    <motion.div
      className="hidden md:flex h-screen bg-background overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
            {children}
          </motion.div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </motion.div> */}






}