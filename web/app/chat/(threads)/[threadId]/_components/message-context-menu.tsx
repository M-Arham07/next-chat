"use client"
import { useChatApp } from "@/features/chat/hooks/use-chat-app"
import { Message } from "@chat/shared"
import { motion, AnimatePresence } from "framer-motion"
import { Reply, Copy, Trash2, MoreHorizontal } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface MessageContextMenuProps {
  message: Message
  isMe:boolean
  position: { x: number; y: number } | null
  handleReplyToMsg: () => void
  onClose: () => void
}

const MessageContextMenu = ({
  message,
  isMe,
  position,
  handleReplyToMsg,
  onClose,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!position || !menuRef.current) return

    const rect = menuRef.current.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }

    let x = position.x
    let y = position.y

    // Adjust if menu goes off right edge
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 16
    }

    // Adjust if menu goes off bottom
    if (y + rect.height > viewport.height) {
      y = position.y - rect.height - 8
    }

    setAdjustedPosition({ x, y })
  }, [position])

  // Handle click outside is now managed by parent component through onClose callback
  // The backdrop overlay handles closing the menu via React onClick


  const { handleDeleteMessage } = useChatApp()!;


  const handleReply = () => {
    handleReplyToMsg()
    onClose()
  }

  const handleCopy = () => {

    // TODO: NEED TO BLOCK COPY IN CASE OF other than text msg
    if (message.content) {
      navigator.clipboard.writeText(message.content)
    }
    onClose()
  }




  const handleDelete = async () : Promise<void> => {



    onClose();

    await handleDeleteMessage(message);


    return;
  }

  const menuItems = [
    {
      icon: Reply,
      label: "Reply",
      onClick: handleReply,
      colorClass: "text-foreground",
    },
    {
      icon: Copy,
      label: "Copy",
      onClick: handleCopy,
      colorClass: "text-foreground",
    },

    // Hide delete icon if message.sender isnt session.user.username! 
    {
      icon: Trash2,
      label: "Delete",
      onClick: handleDelete,
      colorClass: isMe ? "text-destructive" : "hidden",
    },
    {
      icon: MoreHorizontal,
      label: "More",
      onClick: () => alert("More options triggered"),
      colorClass: "text-foreground",
    },
  ]

  return (
    <AnimatePresence>
      {position && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-99"
          />

          {/* Context Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={
              adjustedPosition
                ? {
                  position: "fixed",
                  left: `${adjustedPosition.x}px`,
                  top: `${adjustedPosition.y}px`,
                }
                : undefined
            }
            className="z-100 bg-secondary backdrop-blur-xl border border-glass-border rounded-2xl shadow-lg overflow-hidden w-64"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon and label layout */}
            <div className="flex flex-col divide-y divide-glass-border">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={item.onClick}
                    className={`flex items-center gap-3 px-4 py-3 w-full hover:bg-primary/10 transition-colors text-left ${item.colorClass}`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    <span className="font-medium text-base">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MessageContextMenu
