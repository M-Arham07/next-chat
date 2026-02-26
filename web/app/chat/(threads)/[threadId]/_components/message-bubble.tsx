"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Check, CheckCheck } from "lucide-react"
import { useState, useRef, useEffect } from "react"


import TextMessage from "./text-message"
import ImageMessage from "./image-message"
import VoiceMessage from "./voice-message"
import DocumentMessage from "./document-message"
import MessageContextMenu from "./message-context-menu"
import TypingIndicator from "./typing-indicator"
import { Message } from "@chat/shared"
import { useSession } from "next-auth/react"
import { useChatApp } from "@/features/chat/hooks/use-chat-app"
import { formatTime } from "@/lib/format-time"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const MAX_SWIPE_THRESHOLD: number = 80;


interface MessageBubbleProps {
  message: Message
  isHighlighted: boolean
  onReplyClick: (messageId: string) => void
  onReply: (message: Message) => void
  displayPic: { url?: string, show?: boolean }
  status: string

}
const MessageBubble = ({


  message,
  isHighlighted,
  onReplyClick,
  status = "sent",
  displayPic,
  onReply


}: MessageBubbleProps) => {
  const [swipeX, setSwipeX] = useState(0)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasTriggeredReply = useRef(false);

  const { data: session } = useSession();
  const { messages, handleRetryMessage } = useChatApp()!;






  // if this message is a reply to another message, get the message to which this message is a reply to!


  const repliedToMsg: Message | null = messages![message.threadId].find(m => m.msgId === message?.replyToMsgId) ?? null;




  // have i sent this messagee ? 
  const isSent: boolean = session?.user?.username === message.sender;

  // is the message read ? 
  const isRead = true; // FOR NOW, I'LL USE PLACEHOLDER TRUE!;



  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
    hasTriggeredReply.current = false
    longPressTimerRef.current = setTimeout(() => {
      const touch = e.touches[0]
      openContextMenu(touch.clientX, touch.clientY)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const verticalDiff = Math.abs(currentY - swipeStartY.current)

    // Cancel long-press if user scrolls vertically beyond 10px
    if (verticalDiff > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }

    // Allow horizontal swipe only if minimal vertical movement
    if (verticalDiff > 30) return

    const horizontalDiff = isSent ? swipeStartX.current - currentX : currentX - swipeStartX.current

    if (horizontalDiff > 0) {
      // Clamp visual translation to 150px max, but allow diff to go beyond
      const clampedSwipe = Math.min(horizontalDiff, 150)
      setSwipeX(clampedSwipe)
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }

    // Trigger reply only once, when threshold is crossed
    if (swipeX >= MAX_SWIPE_THRESHOLD && !hasTriggeredReply.current) {
      hasTriggeredReply.current = true;

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(5); //CAN BE CHANGED
      }

      // Trigger reply and reset
      onReply(message);
      setSwipeX(0);
    } else {
      // Reset swipe without triggering reply
      setSwipeX(0)
    }
  }


  const openContextMenu = (x: number, y: number) => {
    setContextMenuPosition({ x, y });

  }




  const getStatusStyles = () => {
    if (!isSent) return ""
    if (status === "sending") return "opacity-50"
    if (status === "failed") return "border-red-500 bg-red-500/10"
    return ""
  }



  const MessageBubbleAvatar = ({ className }: { className: string }) => (

    !isSent && displayPic.show && (
      <Avatar className={className}>
        <AvatarImage src={displayPic.url ?? null} />
        <AvatarFallback>
          {message.sender?.[3]?.toUpperCase()}
        </AvatarFallback>
      </Avatar >
    )
  );






if (message.type === "deleted") {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: isSent ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isSent ? "justify-end" : "justify-start"} px-4 py-1 relative `}
    >

      <MessageBubbleAvatar className="w-6 h-6 shrink-0 relative -bottom-1.5 -left-2" />
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-glass-border">
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
          <div className="w-2 h-0.5 bg-muted-foreground rotate-45" />
        </div>

        <span className="text-sm text-muted-foreground italic">You deleted this message</span>
        <span className="text-xs text-muted-foreground ml-2">{formatTime(message.timestamp)}</span>
      </div>
    </motion.div>
  )
}

return (
  <>
    <motion.div
      ref={containerRef}
      animate={{ x: isSent ? -swipeX : swipeX }}
      transition={swipeX === 0 ? { type: "spring", stiffness: 500, damping: 30 } : { type: "tween", duration: 0, ease: "linear" }}
      className={`flex items-end ${isSent ? "justify-end" : "justify-start"} px-4 py-1 group relative gap-2 ${!isSent ? "ml-5" : ""}`}

      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault()
        openContextMenu(e.clientX, e.clientY)
      }}
      role="button"
      tabIndex={0}
      style={{ touchAction: "pan-y" }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onReply(message);
        }
      }}
    >
      {/* Swipe reply indicator */}
      {swipeX > 0 && (
        <motion.div
          className={`absolute ${isSent ? "right-full mr-2" : "left-full ml-2"} top-1/2 transform -translate-y-1/2 flex items-center gap-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.min(swipeX / MAX_SWIPE_THRESHOLD, 1) }}
        >
          <span className="text-xs font-medium text-primary whitespace-nowrap">
            {swipeX >= MAX_SWIPE_THRESHOLD ? "Releasing..." : "Swipe to reply"}
          </span>
        </motion.div>
      )}

      <motion.div
        animate={
          isHighlighted ? { backgroundColor: ["rgb(var(--highlight-start))", "rgb(var(--highlight-end))"] } : {}
        }
        transition={isHighlighted ? { duration: 0.5, repeat: 4, repeatType: "reverse" } : {}}
        className={`relative max-w-[80%] rounded-2xl backdrop-blur-sm border border-glass-border overflow-hidden ${getStatusStyles()} ${isSent ? "bg-message-sent rounded-br-md" : "bg-message-received rounded-bl-md"
          }`}
      >



        {/* Message reply preview section: */}
        {repliedToMsg && (
          <div
            onClick={() => onReplyClick(repliedToMsg.msgId || "")}
            className="px-3 pt-2 pb-1 border-l-2 border-primary/50 mx-2 mt-2 bg-secondary/30 rounded cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <p className="text-xs font-medium text-primary">{repliedToMsg.sender === session?.user?.username ? "You" : repliedToMsg.sender}</p>
            <p className="text-xs text-muted-foreground truncate">{repliedToMsg.content}</p>
          </div>
        )}

        {message.type === "text" && message.content && <TextMessage content={message.content} />}
        {message.type === "image" && message.content && <ImageMessage imageUrl={message.content} />}
        {message.type === "voice" && message.content && <VoiceMessage voiceUrl={message.content} />}
        {message.type === "document" && message.content && (
          <DocumentMessage documentName={"Placeholder name"} documentUrl={message.content} />
        )}

        <div
          className={`flex items-center justify-end gap-1 px-3 pb-2 ${message.type === "image" ? "absolute bottom-1 right-1 bg-background/60 rounded-full px-2 py-1" : ""
            }`}
        >
          <span className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</span>
          {isSent &&
            (status === "sending" ? (
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
            ) : status === "failed" ? (
              <span className="text-xs text-red-500 font-semibold">!</span>
            ) : isRead ? (
              <CheckCheck className="w-4 h-4 text-primary" />
            ) : (
              <Check className="w-4 h-4 text-muted-foreground" />
            ))}
        </div>
      </motion.div>

      {isSent && status === "failed" && (
        <button
          // Show retry button in case message sending failed
          // WE'LL SEND THE MESSAGE WITH LATEST TIMESTAMP!
          onClick={async () => {
            await handleRetryMessage(message);
          }}
          className="ml-2 px-3 py-1 text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
        >
          Retry
        </button>
      )}
    </motion.div >

    <MessageBubbleAvatar className="w-6 h-6 shrink-0 relative -top-7 -right-2" />

    <MessageContextMenu
      message={message}
      isMe={isSent} // is this message from me?
      position={contextMenuPosition}
      handleReplyToMsg={() => onReply(message)}
      onClose={() => setContextMenuPosition(null)} />
  </>
)
}

export default MessageBubble
