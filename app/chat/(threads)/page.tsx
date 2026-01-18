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




}