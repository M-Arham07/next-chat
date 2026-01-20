"use client"

import { useState, useEffect, useRef, use } from "react"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import ChatHeader from "./_components/chat-header"
import ChatInput from "./_components/chat-input"
import MessageBubble from "./_components/message-bubble-with-voice"
import DateSeparator from "./_components/date-separator"
import { useTheme } from "next-themes"
import { Message } from "@/packages/shared/types"
import { useChatApp } from "@/features/chat/hooks/use-chat-app"




const MESSAGES_PER_LOAD = 10

// Helper to get last N messages
const getLastNMessages = (messages: Message[], n: number) => {
    return messages.slice(-n)
}



interface ChatViewProps {
    params: Promise<{ threadId: string }>
}
export default function ChatsView({ params }: ChatViewProps) {

    // TO RENDER THE MESSAGES FOR THE OPENED THREAD ID:

    const threadId: string | null = use(params)?.threadId ?? null;





    const { messages } = useChatApp()!;
    const [totalMessagesLoaded, setTotalMessagesLoaded] = useState(MESSAGES_PER_LOAD)
    const [mounted, setMounted] = useState(false)
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
    const [replyingTo, setReplyingTo] = useState<{ id: string; content: string } | null>(null)
    const [contextMenuOpenMessageId, setContextMenuOpenMessageId] = useState<string | null>(null)
    const [loadingState, setLoadingState] = useState<"idle" | "loading" | "failed">("idle")
    const [loadingCount, setLoadingCount] = useState(0)
    const { theme, toggleTheme } = useTheme()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageRefsMap = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const sentinelRef = useRef<HTMLDivElement>(null)
    const loadTriggerCountRef = useRef(0)
    const mainRef = useRef<HTMLElement>(null)
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const observedCountRef = useRef<number>(0)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Scroll to bottom on mount (instant, no animation)
    useEffect(() => {
        if (mounted && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" })
        }
    }, [mounted])

    // Cleanup loading timeout on unmount
    useEffect(() => {
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
            }
        }
    }, []);


    // Intersection Observer for infinite scroll at top
    useEffect(() => {
        if (!sentinelRef.current || !mainRef.current || !mounted) return


        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    console.log("[v0] Sentinel visibility:", entry.isIntersecting, "ratio:", entry.intersectionRatio)

                    // Only trigger when sentinel becomes visible (enters viewport)
                    if (entry.isIntersecting) {
                        loadTriggerCountRef.current += 1
                        console.log("[v0] Load trigger count:", loadTriggerCountRef.current)



                        // Clear any existing timeout
                        if (loadingTimeoutRef.current) {
                            clearTimeout(loadingTimeoutRef.current)
                        }

                        // Show loading state
                        setLoadingState("loading")
                        setLoadingCount(loadTriggerCountRef.current)

                        // Simulate loading for 2 seconds, then randomly succeed or fail
                        loadingTimeoutRef.current = setTimeout(() => {
                            const shouldFail = Math.random() > 0.7 // 30% chance of failure
                            if (shouldFail) {
                                setLoadingState("failed")
                                // Show error for 2 more seconds
                                loadingTimeoutRef.current = setTimeout(() => {
                                    setLoadingState("idle")
                                }, 2000)
                            } else {
                                // Load the next batch of messages
                                setTotalMessagesLoaded((prev) => {
                                    const newTotal = Math.min(prev + MESSAGES_PER_LOAD, initialMessages.length)
                                    console.log("[v0] Loading messages, new total:", newTotal)
                                    const newMessages = initialMessages.slice(-newTotal)
                                    setMessages(newMessages)
                                    return newTotal
                                })
                                setLoadingState("idle")
                            }
                        }, 2000)
                    }
                })
            },
            {
                root: null,
                threshold: 0.01,
                rootMargin: "0px 0px 1000px 0px"
            },
        )


        if (sentinelRef.current) {
            observer.observe(sentinelRef.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [mounted])


    const handleReplyClick = (messageId: string) => {
        const messageElement = messageRefsMap.current[messageId]
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: "smooth", block: "center" })

            setHighlightedMessageId(messageId)

            setTimeout(() => {
                setHighlightedMessageId(null)
            }, 2000)
        }
    }

    const handleContextMenuReply = (messageId: string, content: string) => {
        const message = messages.find((m) => m.id === messageId)
        if (message) {
            setReplyingTo({
                id: messageId,
                content: content || "Voice message" || "Image message" || "Document message",
            })
        }
    }

    const handleDeleteMessage = (messageId: string) => {
        setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? { ...msg, type: "deleted" as const, content: undefined } : msg)),
        )
    }

    const handleSendMessage = (
        content: string,
        type?: string,
        audioUrl?: string,
        duration?: string,
        fileData?: { name: string; url: string; type: string },
    ) => {
        const timestamp = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })

        if (type === "voice" && audioUrl) {
            const newMessage: Message = {
                id: Date.now().toString(),
                timestamp,
                isSent: true,
                isRead: false,
                type: "voice",
                voiceUrl: audioUrl,
                voiceDuration: duration || "0:00",
                status: "sending",
                replyTo: replyingTo
                    ? {
                        name: "You",
                        content: replyingTo.content,
                        messageId: replyingTo.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingTo(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        } else if (type === "image" && audioUrl) {
            const newMessage: Message = {
                id: Date.now().toString(),
                timestamp,
                isSent: true,
                isRead: false,
                type: "image",
                imageUrl: audioUrl,
                status: "sending",
                replyTo: replyingTo
                    ? {
                        name: "You",
                        content: replyingTo.content,
                        messageId: replyingTo.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingTo(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        } else if (type === "document" && fileData) {
            const newMessage: Message = {
                id: Date.now().toString(),
                timestamp,
                isSent: true,
                isRead: false,
                type: "document",
                documentName: fileData.name,
                documentUrl: fileData.url,
                status: "sending",
                replyTo: replyingTo
                    ? {
                        name: "You",
                        content: replyingTo.content,
                        messageId: replyingTo.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingTo(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        } else if (content.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                content,
                timestamp,
                isSent: true,
                isRead: false,
                type: "text",
                status: "sending",
                replyTo: replyingTo
                    ? {
                        name: "You",
                        content: replyingTo.content,
                        messageId: replyingTo.id,
                    }
                    : undefined,
            }
            setMessages((prev) => [...prev, newMessage])
            setReplyingTo(null)
            setTimeout(() => {
                setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
            }, 1000)
        }
    }

    const handleRetryMessage = (messageId: string) => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "sending" as const } : msg)))
        setTimeout(() => {
            setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" as const } : msg)))
        }, 1000)
    }

    const handleContextMenuOpenChange = (isOpen: boolean, messageId: string) => {
        setContextMenuOpenMessageId(isOpen ? messageId : null)
    }

    if (!mounted) {
        return null
    }

    return (
        <div className="h-full bg-background relative overflow-hidden flex flex-col">
            <motion.button
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
            </motion.button>

            <ChatHeader name="+92 332 6910247" status="online" avatarInitial="W" />

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
                    {contextMenuOpenMessageId && <div className="absolute inset-0 pointer-events-none z-40" />}

                    {messages?.[threadId]?.map((message) => {
                        const isContextMenuOpen = contextMenuOpenMessageId !== null
                        const isThisMessageOpen = contextMenuOpenMessageId === message.id
                        const shouldBlur = isContextMenuOpen && !isThisMessageOpen

                        return (
                            <div
                                key={message.id}
                                ref={(el) => {
                                    if (el) messageRefsMap.current[message.id] = el
                                }}
                                style={{
                                    filter: shouldBlur ? "blur(6px)" : "none",
                                    opacity: shouldBlur ? 0.4 : 1,
                                    pointerEvents: shouldBlur ? "none" : "auto",
                                    transition: "filter 0.2s ease, opacity 0.2s ease, pointer-events 0.2s ease",
                                }}
                            >
                                <MessageBubble
                                    isHighlighted={highlightedMessageId === message.id}
                                    onReplyClick={handleReplyClick}
                                    onSwipeReply={() => handleContextMenuReply(message.id, message.content || "")}
                                    status={message.status}
                                    onRetry={() => handleRetryMessage(message.id)}
                                    onContextMenuReply={handleContextMenuReply}
                                    onDeleteMessage={handleDeleteMessage}
                                    onContextMenuOpenChange={handleContextMenuOpenChange}
                                />
                            </div>
                        )
                    }) || <h1>NO MESSAGES FOUND FOR THIS THREAD</h1>}

                    <div ref={messagesEndRef} />
                </div>
            </motion.main>

            {replyingTo && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-24 left-0 right-0 px-4 z-40"
                >
                    <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3 bg-secondary/50 backdrop-blur-sm border border-glass-border rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-primary">Replying to message</p>
                            <p className="text-sm text-foreground truncate">{replyingTo.content}</p>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}

            <div
                style={{
                    filter: contextMenuOpenMessageId ? "blur(8px)" : "none",
                    transition: "filter 0.2s ease",
                }}
            >
                <ChatInput onSend={handleSendMessage} />
            </div>
        </div>
    )

}

