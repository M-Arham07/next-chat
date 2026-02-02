"use client"

import { useState, useEffect, useRef, use } from "react"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import ChatHeader from "./_components/chat-header"
import ChatInput from "./_components/chat-input"
import MessageBubble from "./_components/message-bubble"
import DateSeparator from "./_components/date-separator"
import { useTheme } from "next-themes"
import { Message } from "@chat/shared"
import { useChatApp } from "@/features/chat/hooks/use-chat-app"





interface ChatViewProps {
    params: Promise<{ threadId: string }>
}
export default function MessagesView({ params }: ChatViewProps) {

    // TO RENDER THE MESSAGES FOR THE OPENED THREAD ID:

    const threadId: string | null = use(params)?.threadId ?? null;


    useEffect(() => {
        set("selectedThreadId", threadId);

        
        return () => {
            set("selectedThreadId",undefined);

            // EXTREMELY IMPORTANT:
            set("replyingToMsg",null);
        }
    }, [threadId]);






    const { messages, replyingToMsg, handleSendMessage, set } = useChatApp()!;
    




    const [mounted, setMounted] = useState(false)


    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);






    const [loadingState, setLoadingState] = useState<"idle" | "loading" | "failed">("idle")
    const [loadingCount, setLoadingCount] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageRefsMap = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const sentinelRef = useRef<HTMLDivElement>(null)
    const loadTriggerCountRef = useRef(0)
    const mainRef = useRef<HTMLElement>(null)
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // TO AUTOMATICALLY FOCUS ON CHAT INPUT WHEN REPLYING TO A MESSAGE
    const inputRef = useRef<HTMLInputElement | null>(null);
    




    useEffect(() => {
        setMounted(true);
    }, [])

    // Scroll to bottom on mount (instant, no animation)
    useEffect(() => {
        if (mounted && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" })
        }
    }, [mounted,messages]);

    // Cleanup loading timeout on unmount
    useEffect(() => {
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
            }
        }
    }, []);


    // // Intersection Observer for infinite scroll at top
    // useEffect(() => {
    //     if (!sentinelRef.current || !mainRef.current || !mounted) return


    //     const observer = new IntersectionObserver(
    //         (entries) => {
    //             entries.forEach((entry) => {
    //                 console.log("[v0] Sentinel visibility:", entry.isIntersecting, "ratio:", entry.intersectionRatio)

    //                 // Only trigger when sentinel becomes visible (enters viewport)
    //                 if (entry.isIntersecting) {
    //                     loadTriggerCountRef.current += 1
    //                     console.log("[v0] Load trigger count:", loadTriggerCountRef.current)



    //                     // Clear any existing timeout
    //                     if (loadingTimeoutRef.current) {
    //                         clearTimeout(loadingTimeoutRef.current)
    //                     }

    //                     // Show loading state
    //                     setLoadingState("loading")
    //                     setLoadingCount(loadTriggerCountRef.current)

    //                     // Simulate loading for 2 seconds, then randomly succeed or fail
    //                     loadingTimeoutRef.current = setTimeout(() => {
    //                         const shouldFail = Math.random() > 0.7 // 30% chance of failure
    //                         if (shouldFail) {
    //                             setLoadingState("failed")
    //                             // Show error for 2 more seconds
    //                             loadingTimeoutRef.current = setTimeout(() => {
    //                                 setLoadingState("idle")
    //                             }, 2000)
    //                         } else {



    //                             setLoadingState("idle")
    //                         }
    //                     }, 2000)
    //                 }
    //             })
    //         },
    //         {
    //             root: null,
    //             threshold: 0.01,
    //             rootMargin: "0px 0px 1000px 0px"
    //         },
    //     )


    //     if (sentinelRef.current) {
    //         observer.observe(sentinelRef.current)
    //     }

    //     return () => {
    //         observer.disconnect()
    //     }
    // }, [mounted])




    const handleReplyPreviewClick = (messageId: string) => {
        // when u click on a reply preview, it will scroll to that message and highlight it for 2 seconds
        const messageElement = messageRefsMap.current[messageId];
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: "smooth", block: "center" })

            setHighlightedMessageId(messageId)

            setTimeout(() => {
                setHighlightedMessageId(null)
            }, 2000)
        }
    }








    if (!mounted) {
        return null
    }

    return (
        <div className="h-full bg-background relative overflow-hidden flex flex-col">
            {/* <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleTheme}
                className="absolute top-2 right-2 z-40 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors border border-glass-border"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
                {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-foreground" />
                ) : (
                    <Moon className="w-5 h-5 text-foreground" />
                )}
            </motion.button> */}

            <ChatHeader name="TEST" status="online" avatarInitial="W" />

            {/* Loading state display below header */}
            {loadingState !== "idle" && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-20 left-0 right-0 z-40 flex justify-center px-4"
                >
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${loadingState === "loading"
                            ? "bg-secondary/50 border-glass-border text-foreground"
                            : "bg-red-500/20 border-red-500/50 text-red-500"
                            }`}
                    >
                        {loadingState === "loading" && (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 rounded-full border-2 border-transparent border-t-foreground"
                                />
                                <span className="text-sm font-medium">Loading Messages +{loadingCount}</span>
                            </>
                        )}

                        {loadingState === "failed" && (
                            <>
                                <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500">
                                    <div className="w-1 h-3 bg-red-500 transform rotate-45" />
                                </div>
                                <span className="text-sm font-medium">Loading Failed</span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            <motion.main
                ref={mainRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-h-0 overflow-y-auto pt-20 pb-24 flex flex-col custom-scrollbar"
            >
                <div ref={sentinelRef} className="border h-2"></div>

                <DateSeparator date="Today" />

                <div className="space-y-1 relative">
                    {/* {contextMenuOpenMessageId && <div className="absolute inset-0 pointer-events-none z-40" />} */}

                    {messages?.[threadId]?.map((message) => {

                        // const isContextMenuOpen = contextMenuOpenMessageId !== null


                        // const isThisMessageOpen = contextMenuOpenMessageId === message.msgId
                        // const shouldBlur = isContextMenuOpen && !isThisMessageOpen

                        return (
                            <div
                                key={message.msgId}
                                ref={(el) => {
                                    if (el) messageRefsMap.current[message.msgId] = el
                                }}
                                style={{
                                    filter: "none",
                                    opacity: 1,
                                    pointerEvents: "auto",
                                    transition: "filter 0.2s ease, opacity 0.2s ease, pointer-events 0.2s ease",
                                }}
                            >
                                <MessageBubble
                                    message={message}
                                    isHighlighted={highlightedMessageId === message.msgId}
                                    onReplyClick={handleReplyPreviewClick}
                                    onReply={() => {
                                        set("replyingToMsg", message)
                                        // focus the message input so on-screen keyboard shows up
                                        inputRef?.current?.focus();

                                    }}
                                    status={message.status}
                                />
                            </div>
                        )
                    }) || <h1>NO MESSAGES FOUND FOR THIS THREAD</h1>}

                    <div ref={messagesEndRef} />
                </div>
            </motion.main>


            {replyingToMsg && 
            
              (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="fixed bottom-24 left-0 right-0 px-4 z-40"
                >
                    <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3 bg-secondary/50 backdrop-blur-sm border border-glass-border rounded-lg">
                        <div className="flex-1 min-w-0">

                            <p className="text-xs font-medium text-primary">Replying to {replyingToMsg.sender}</p>
                            <p className="text-sm text-foreground truncate">{replyingToMsg.content}</p>
                        </div>
                        <button
                            onClick={() => set("replyingToMsg", null)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}

            <div
            // style={{
            //     filter: contextMenuOpenMessageId ? "blur(8px)" : "none",
            //     transition: "filter 0.2s ease",
            // }}
            >
                <ChatInput onSend={handleSendMessage} inputRef={inputRef} />
            </div>
        </div>
    )

}

