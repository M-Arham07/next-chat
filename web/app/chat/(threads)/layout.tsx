"use client";
import { ComingSoon } from "../_components/shared";
import { motion, AnimatePresence } from "framer-motion";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { DesktopSidebar, NavTab } from "../_components/layout";
import { ThreadHeader, ThreadFilterTabs, ThreadItem, ThreadList } from "../_components";
import { FloatingActionButton } from "../_components";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { ActiveFilter } from "@/features/chat/types";





export default function ThreadsLayout({ children }: { children: React.ReactNode }) {



    const { activeTab,
        searchQuery,
        filteredThreads,
        mounted,
        activeFilter, set

    } = useChatApp()!;


    if (!mounted) return null;



    return (
        <>


            {/* ================= DESKTOP LAYOUT ================= */}
            <motion.div
                className="hidden md:flex h-screen bg-background overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <DesktopSidebar
                    activeTab={activeTab}
                    onTabChange={(tab: NavTab) => set("activeTab", tab)}
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
                                            onSearchChange={(query: string) => set("searchQuery", query)}
                                        />

                                        <ThreadFilterTabs
                                            activeFilter={activeFilter}
                                            onFilterChange={(val: ActiveFilter) => set("activeFilter", val)}
                                        />

                                        <div className="flex-1 min-h-0 overflow-y-auto">
                                            <ThreadList
                                                threads={filteredThreads}
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

                    <ResizableHandle className="w-px bg-border/50 hover:bg-foreground/20 transition-colors data-resize-handle-active:bg-foreground/30" />

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
            </motion.div>



            <div className="md:hidden">
                {children}
            </div>


        </>











    )




};

