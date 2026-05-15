"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ChatHeader from "./chat-header";
import ChatInput from "./chat-input";
import MessageBubble from "./message-bubble";
import DateSeparator from "./date-separator";
import { useChatApp } from "@/features/chat/hooks/use-chat-app"
import TypingIndicator from "./typing-indicator";
import { useInfiniteScroll } from "@/features/chat/hooks/use-infinite-scroll";
import Loading from "../loading";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Message, participant } from "@chat/shared";




// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns "Today", "Yesterday", or a formatted date string */
function getDateLabel(isoTimestamp: string): string {
    const msgDate = new Date(isoTimestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(msgDate, today)) return "Today";
    if (isSameDay(msgDate, yesterday)) return "Yesterday";

    return msgDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        ...(msgDate.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
    });
}

// ───────────────────────────────────────────────────────────────────────────

export default function MessagesViewClient({ threadId }: { threadId: string }) {



    const { messages, replyingToMsg, handleSendMessage, handleRetryMessage, handleTyping, set, stopTypingEmit, threads, typingUsers } = useChatApp()!;

    // must not be null , null auth will be blocked by loading screen
    const { profile } = useAuth()!;

    const thisThread = threads?.find(t => t.threadId === threadId);

    let otherParticipant: participant | undefined = undefined;

    if (thisThread?.type === "direct" && profile?.username) {
        otherParticipant = thisThread.participants?.find(p => p.username.toLowerCase() !== profile.username.toLowerCase());
    }

    const threadMessages = messages?.[threadId] ?? [];
    const repliedToMessageMap = useMemo(() => {
        const nextMap = new Map<string, Message>();

        for (const message of threadMessages) {
            nextMap.set(message.msgId, message);
        }

        return nextMap;
    }, [threadMessages]);


    const [mounted, setMounted] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);



    const [loadingState, setLoadingState] = useState<"idle" | "loading" | "failed">("idle");

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageRefsMap = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const sentinelRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);



    // TO AUTOMATICALLY FOCUS ON CHAT INPUT WHEN REPLYING TO A MESSAGE
    const inputRef = useRef<HTMLInputElement | null>(null);


    //     useEffect(() => {
    //     const container = mainRef.current;
    //     if (!container) return;

    //     const previousScroll = container.scrollTop;

    //     requestAnimationFrame(() => {
    //         container.scrollTop = previousScroll;
    //     });

    // }, [messages]);



    // One-shot scroll to bottom: fires the first time messages for this thread appear in the DOM
    const hasScrolledRef = useRef(false);
    useEffect(() => {
        if (hasScrolledRef.current) return;
        if (!threadMessages.length) return;

        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
            hasScrolledRef.current = true;
        });
    }, [threadMessages]);










    // Intersection Observer for infinite scroll at top
    const { retry } = useInfiniteScroll(threadId, sentinelRef, mainRef, mounted, setLoadingState);




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

    const handleReply = useCallback((message: Message) => {
        set("replyingToMsg", message);
        inputRef?.current?.focus();
    }, [set]);



    useEffect(() => {

        if (!mounted) setMounted(true);

        return () => {

            // EXTREMELY IMPORTANT:
            set("replyingToMsg", null);

            stopTypingEmit(threadId);

        }
    }, []);



    if (!mounted || !profile) {
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
                                <button
                                    onClick={retry}
                                    className="ml-1 text-sm font-semibold underline underline-offset-2 hover:text-red-400 transition-colors"
                                >
                                    Try Again
                                </button>
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


                <div className="space-y-1 relative">
                    {/* {contextMenuOpenMessageId && <div className="absolute inset-0 pointer-events-none z-40" />} */}

                    {threadMessages.map((message, idx) => {
                        const prevMsg = threadMessages[idx - 1];
                        const showSeparator = !prevMsg ||
                            getDateLabel(prevMsg.timestamp) !== getDateLabel(message.timestamp);
                        const repliedToMsg = message.replyToMsgId ? repliedToMessageMap.get(message.replyToMsgId) ?? null : null;

                        return (
                            <div key={message.msgId}>

                                {showSeparator && (
                                    <DateSeparator date={getDateLabel(message.timestamp)} />
                                )}

                                <div
                                    ref={(el) => {
                                        if (el) {
                                            messageRefsMap.current[message.msgId] = el;


                                        }
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
                                        // have i sent this message?
                                        isSent={message.sender === profile.id}
                                        isHighlighted={highlightedMessageId === message.msgId}
                                        onReplyClick={handleReplyPreviewClick}
                                        onReply={handleReply}
                                        onRetry={handleRetryMessage}
                                        repliedToMsg={repliedToMsg}


                                        displayPic={
                                            {
                                                url: thisThread?.participants.find(p => p.userId === message.sender)?.image,

                                                // if previous message was of the same user ,dont show his dp again 

                                                show: threadMessages[idx - 1]?.sender !== message.sender
                                            }
                                        }
                                        status={message.status}
                                    />
                                </div>

                            </div>
                        );
                    })}

                    {threadMessages.length === 0 && <h1>Start a conversation </h1>}

                    {/* Render typing bubbles: */}
                    {[...(typingUsers?.[threadId] ?? [])].map((typingUserId) => {
                        const user = thisThread?.participants.find((p) => p.userId === typingUserId);
                        return (
                            <TypingIndicator
                                key={typingUserId}
                                isSent={typingUserId === profile.id}
                                displayPicUrl={user?.image}
                                username={user?.username}
                            />
                        );
                    })}

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

