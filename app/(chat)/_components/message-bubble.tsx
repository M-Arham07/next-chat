"use client";

import {
    FileText,
    Mic,
    Image as ImageIcon,
    Check,
    CheckCheck,
    Reply,
    Play,
    Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./styles/message-bubble.module.css";
import { useBubbleSwiper } from "@/features/chat/hooks/message-bubble/use-bubble-swiper";

interface ReplyMessage {
    repliedTo: string;
    content: string;
}

interface MessageBubbleProps {
    type: "text" | "image" | "document" | "voice";
    content: string;
    replyMsgId?: string | null;
    replyMessage?: ReplyMessage | null;
    senderName?: string;
    timestamp?: string;
    avatarUrl?: string;
    isMe?: boolean;
    isRead?: boolean;
    onSwipeReply?: (messageId: string) => void;
    messageId?: string;
}

export function MessageBubble({
    type,
    content,
    replyMsgId,
    replyMessage,
    senderName = "User",
    timestamp = "11:19 AM",
    avatarUrl,
    isMe = false,
    isRead = true,
    onSwipeReply,
    messageId,
}: MessageBubbleProps) {
    const hasReply = replyMsgId && replyMessage;


    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);



    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { handleTouchMove, handleTouchStart, handleTouchEnd, showReplyIcon, swipeOffset } = useBubbleSwiper(isMe, messageId);


    useEffect(() => {
        if (type !== "voice") return;

        const audio = new Audio("https://xsjwgtwwnwalsivubcrz.supabase.co/storage/v1/object/public/image/public/Evillaugh.ogg");
        audio.preload = "metadata";
        audioRef.current = audio;

        const onEnded = () => {
            setIsPlaying(false);
            setAudioProgress(0);
        };

        const onTimeUpdate = () => {
            // duration can be NaN/0 until metadata loads
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
            setAudioProgress((audio.currentTime / audio.duration) * 100);
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener("ended", onEnded);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);

        return () => {
            audio.pause();
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audioRef.current = null;
        };
    }, [type]);

    const togglePlay = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (!audio.paused) {
                audio.pause();
            } else {
                await audio.play(); // <- IMPORTANT: handle the play() promise
            }
        } catch (err) {
            console.error("Audio play failed:", err);
        }
    }, []);



    const renderContent = () => {
        switch (type) {
            case "image":
                return (
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm">Photo</span>
                    </div>
                );
            case "document":
                return (
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[200px] sm:max-w-[300px]">
                            {content}
                        </span>
                    </div>
                );
            case "voice":
                return (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity",
                                styles.senderBg
                            )}
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4 text-white" />
                            ) : (
                                <Play className="h-4 w-4 text-white ml-0.5" />
                            )}
                        </button>

                        <div className="flex items-center gap-1">
                            <div className="w-24 sm:w-32 h-1 bg-current/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-current/70 rounded-full transition-all duration-100"
                                    style={{ width: `${audioProgress}%` }}
                                />
                            </div>
                            <span className="text-xs">{content}</span>
                        </div>
                    </div>
                );
            default:
                return <p className="text-sm sm:text-base break-words">{content}</p>;
        }
    };

    return (
        <div
            className={cn(
                styles.root,
                "flex gap-2 max-w-full relative",
                isMe ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Reply Icon - shows on swipe */}
            <div
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 transition-opacity duration-150",
                    isMe ? "left-0" : "right-0",
                    showReplyIcon ? "opacity-100" : "opacity-0"
                )}
            >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", styles.primaryBg)}>
                    <Reply className={cn("h-4 w-4", styles.primaryFg)} />
                </div>
            </div>

            {/* Avatar - only show for others */}
            {!isMe && (
                <div className="flex-shrink-0">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={senderName}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center", styles.mutedBg)}>
                            <span className={cn("text-xs sm:text-sm font-medium", styles.mutedFg)}>
                                {senderName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Message Bubble */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ transform: `translateX(${swipeOffset}px)` }}
                className={cn(
                    "relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-3 py-2 shadow-sm transition-transform duration-100 rounded-2xl",
                    isMe ? cn(styles.bubbleOwn, "rounded-tr-md") : cn(styles.bubbleOther, "rounded-tl-md")
                )}
            >
                {/* Sender Name - only for others */}
                {!isMe && (
                    <p className={cn("text-xs sm:text-sm font-medium mb-1", styles.senderText)}>
                        ~ {senderName}
                    </p>
                )}

                {/* Reply Section */}
                {hasReply && (
                    <div className={cn("rounded-lg px-2 py-1.5 mb-2 border-l-4", styles.replyBg, styles.replyBorder)}>
                        <p className={cn("text-xs font-medium truncate", styles.replyName)}>
                            ~ {replyMessage!.repliedTo}
                        </p>
                        <p className={cn("text-xs line-clamp-2", styles.replyContent)}>
                            {replyMessage!.content}
                        </p>
                    </div>
                )}

                {/* Message Content */}
                {renderContent()}

                {/* Timestamp with read status for own messages */}
                <div className="flex justify-end items-center gap-1 mt-1">
                    <span className={cn("text-[10px] sm:text-xs", isMe ? styles.timestampOwn : styles.timestampOther)}>
                        {timestamp}
                    </span>
                    {isMe &&
                        (isRead ? (
                            <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                        ) : (
                            <Check className={cn("h-3.5 w-3.5", styles.timestampOwn)} />
                        ))}
                </div>
            </div>
        </div>
    );
}
