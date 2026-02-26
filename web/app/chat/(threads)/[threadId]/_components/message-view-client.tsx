"use client";
import { useState, useEffect, useRef, use } from "react"
import ChatHeader from "./chat-header";
import ChatInput from "./chat-input";
import MessageBubble from "./message-bubble";
import DateSeparator from "./date-separator";
import { useChatApp } from "@/features/chat/hooks/use-chat-app"
import TypingIndicator from "./typing-indicator";
import { particpant } from "@chat/shared";
import { useSession } from "next-auth/react";
import { useInfiniteScroll } from "@/features/chat/hooks/use-infinite-scroll";
import Loading from "../loading";
import { notFound } from "next/navigation";




export default function MessagesViewClient({ threadId }: { threadId: string }) {





    const { messages, replyingToMsg, handleSendMessage, handleTyping, set, stopTypingEmit, threads, typingUsers } = useChatApp()!;

    const { data: session } = useSession();

    const thisThread = threads?.find(t => t.threadId === threadId);

    let otherParticipant: particpant | undefined = undefined;

    if (thisThread?.type === "direct") {
        otherParticipant = thisThread.particpants?.find(p => p.username.toLowerCase() !== session?.user?.username?.toLowerCase());
    }


    const [mounted, setMounted] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);



    const [loadingState, setLoadingState] = useState<"idle" | "loading" | "failed">("idle");

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageRefsMap = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const sentinelRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);


    // TO AUTOMATICALLY FOCUS ON CHAT INPUT WHEN REPLYING TO A MESSAGE
    const inputRef = useRef<HTMLInputElement | null>(null);





    // Scroll to bottom on mount (instant, no animation)
    useEffect(() => {
        if (mounted && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" })
        }
    }, [mounted]);



    // Intersection Observer for infinite scroll at top
    useInfiniteScroll(threadId, sentinelRef, mainRef, mounted, setLoadingState);




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



    useEffect(() => {

        if (!mounted) setMounted(true);

        return () => {

            // EXTREMELY IMPORTANT:
            set("replyingToMsg", null);

            stopTypingEmit(threadId);

        }
    }, []);



    if (!mounted) {
        return <Loading />
    }



    return (
        <div className="h-full bg-background relative overflow-y-hidden flex flex-col">


            <ChatHeader
                username={otherParticipant?.username || thisThread?.groupName}
                image={otherParticipant?.image}
                status="online"
            />

            {/* Loading state display below header */}
            {loadingState !== "idle" && (
                <div
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
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-transparent border-t-foreground animate-spin"
                                />
                                <span className="text-sm font-medium">Loading Messages </span>
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
                </div>
            )}

            <main
                ref={mainRef}
                className="flex-1 min-h-0 overflow-x-hidden pt-20 pb-24 flex flex-col custom-scrollbar"
            >

                <div ref={sentinelRef}> </div>


                <DateSeparator date="Today" />

                <div className="space-y-1 relative">
                    {/* {contextMenuOpenMessageId && <div className="absolute inset-0 pointer-events-none z-40" />} */}

                    {messages?.[threadId]?.map((message, idx) => (

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


                                displayPic={
                                    {
                                        url: thisThread?.particpants.find(p => p.username === message.sender)?.image,

                                        // if previous message was of the same user ,dont show his dp again 

                                        show: messages?.[threadId][idx - 1]?.sender !== message.sender
                                    }
                                }
                                status={message.status}
                            />
                        </div>

                    )) || <h1>Start a conversation </h1>}


                    {/* Render typing bubbles: */}
                    {[...(typingUsers?.[threadId] ?? [])].map(typingUsername => (
                        <TypingIndicator isSent={typingUsername === session?.user.username} />
                    ))}



                    <div ref={messagesEndRef} />
                </div>
            </main>


            {replyingToMsg &&

                (
                    <div


                        className="fixed bottom-24 left-0 right-0 px-4 z-40"
                    >
                        <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3 bg-secondary/50 backdrop-blur-sm border border-glass-border rounded-lg">
                            <div className="flex-1 min-w-0">

                                <p className="text-xs font-medium text-primary">Replying to {replyingToMsg.sender}</p>
                                <p className="text-sm text-foreground truncate">{replyingToMsg.content}</p>
                            </div>
                            <button
                                onClick={() => {
                                    set("replyingToMsg", null);
                                    inputRef?.current?.focus();
                                }}
                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

            <div
            // style={{
            //     filter: contextMenuOpenMessageId ? "blur(8px)" : "none",
            //     transition: "filter 0.2s ease",
            // }}
            >
                <ChatInput
                    onSend={(type, content) => {

                        requestAnimationFrame(() => {
                            messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
                        });
                        handleSendMessage(threadId, type, content);
                    }}
                    onTyping={() => handleTyping(threadId)}
                    inputRef={inputRef} />
            </div>
        </div>
    )

}

