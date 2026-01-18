"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import ChatHeader from "./_components/chat-header"
import ChatInput from "./_components/chat-input"
import MessageBubble from "./_components/message-bubble-with-voice"
import DateSeparator from "./_components/date-separator"
import { useTheme } from "next-themes"

interface Message {
  id: string
  content?: string
  timestamp: string
  isSent: boolean
  isRead?: boolean
  type: "text" | "image" | "voice" | "deleted" | "document"
  imageUrl?: string
  voiceDuration?: string
  voiceUrl?: string
  documentName?: string
  documentUrl?: string
  replyTo?: {
    name: string
    content: string
    messageId: string
  }
  status?: "sending" | "sent" | "failed" | "typing"
}

const initialMessages: Message[] = [
  {
    id: "0",
    content: 'Hello World ("print")',
    timestamp: "3:10 PM",
    isSent: true,
    isRead: true,
    type: "text",
    replyTo: {
      name: "You",
      content: "/server",
      messageId: "none",
    },
  },
  {
    id: "1",
    content: "That's a great idea! Let me think about it.",
    timestamp: "3:15 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "2",
    imageUrl: "/stylized-chat-bubbles.png",
    timestamp: "4:36 PM",
    isSent: true,
    isRead: true,
    type: "image",
  },
  {
    id: "3",
    content: "This looks amazing! 🎨",
    timestamp: "4:37 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "4",
    timestamp: "4:40 PM",
    isSent: true,
    type: "deleted",
  },
  {
    id: "5",
    timestamp: "4:41 PM",
    isSent: false,
    type: "voice",
    voiceDuration: "0:02",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "6",
    content: "Perfect! Let's schedule a meeting",
    timestamp: "4:47 PM",
    isSent: true,
    isRead: false,
    type: "text",
    replyTo: {
      name: "+92 332 6910247",
      content: "This looks amazing! 🎨",
      messageId: "3",
    },
  },
  {
    id: "7",
    content: "When are you free?",
    timestamp: "4:48 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "8",
    timestamp: "4:50 PM",
    isSent: true,
    type: "voice",
    voiceDuration: "0:05",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "9",
    content: "Tomorrow at 2 PM works great for me!",
    timestamp: "4:51 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "10",
    imageUrl: "/stylized-chat-bubbles.png",
    timestamp: "4:52 PM",
    isSent: false,
    isRead: true,
    type: "image",
  },
  {
    id: "11",
    content: "Confirmed! See you then 👋",
    timestamp: "4:53 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "12",
    content: "I've been working on the new features you requested",
    timestamp: "5:10 PM",
    isSent: true,
    isRead: true,
    type: "text",
  },
  {
    id: "13",
    content: "Oh great! How's the progress?",
    timestamp: "5:12 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "14",
    content: "About 60% done. Should be ready by end of week",
    timestamp: "5:15 PM",
    isSent: true,
    isRead: true,
    type: "text",
    replyTo: {
      name: "+92 332 6910247",
      content: "Oh great! How's the progress?",
      messageId: "13",
    },
  },
  {
    id: "15",
    timestamp: "5:18 PM",
    isSent: false,
    type: "voice",
    voiceDuration: "0:03",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "16",
    content: "That's excellent news!",
    timestamp: "5:20 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "17",
    content: "Do you want me to send you the beta version?",
    timestamp: "5:22 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "18",
    content: "Yes please! I'd love to test it out",
    timestamp: "5:25 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "19",
    imageUrl: "/stylized-chat-bubbles.png",
    timestamp: "5:30 PM",
    isSent: true,
    isRead: true,
    type: "image",
  },
  {
    id: "20",
    content: "Here's the beta version! Check it out and let me know what you think",
    timestamp: "5:31 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "21",
    content: "Will do! Testing it now...",
    timestamp: "5:33 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "22",
    content: "The UI looks really polished! Love the new design",
    timestamp: "5:40 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "23",
    timestamp: "5:42 PM",
    isSent: false,
    type: "voice",
    voiceDuration: "0:04",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "24",
    content: "Found a small bug in the settings page",
    timestamp: "5:45 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "25",
    content: "Oh no! Can you send me details?",
    timestamp: "5:46 PM",
    isSent: true,
    isRead: false,
    type: "text",
    replyTo: {
      name: "+92 332 6910247",
      content: "Found a small bug in the settings page",
      messageId: "24",
    },
  },
  {
    id: "26",
    imageUrl: "/stylized-chat-bubbles.png",
    timestamp: "5:48 PM",
    isSent: false,
    isRead: true,
    type: "image",
  },
  {
    id: "27",
    content: "Here's a screenshot of the bug",
    timestamp: "5:49 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "28",
    content: "Thanks! I'll fix that right away",
    timestamp: "5:50 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "29",
    timestamp: "5:55 PM",
    isSent: true,
    type: "voice",
    voiceDuration: "0:06",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "30",
    content: "Fixed! The issue was in the validation logic",
    timestamp: "5:57 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "31",
    content: "Awesome! You're super fast with fixes",
    timestamp: "6:00 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "32",
    content: "Let's schedule that meeting tomorrow at 2 PM then",
    timestamp: "6:05 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "33",
    content: "Perfect! I've added it to my calendar",
    timestamp: "6:08 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "34",
    content: "See you tomorrow! 🚀",
    timestamp: "6:10 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "35",
    content: "Looking forward to it!",
    timestamp: "6:12 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "36",
    documentName: "project-proposal.pdf",
    documentUrl: "/sample.pdf",
    timestamp: "6:15 PM",
    isSent: true,
    isRead: false,
    type: "document",
  },
  {
    id: "37",
    content:
      "Here's the project proposal document for our review. It contains all the details we discussed in the meeting.",
    timestamp: "6:16 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "38",
    content:
      "Thanks! Let me review this and get back to you with feedback. This is a much longer message to demonstrate how the message bubble expands when the text content is longer than normal.",
    timestamp: "6:20 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "39",
    documentName: "meeting-notes.docx",
    documentUrl: "/sample.pdf",
    timestamp: "6:25 PM",
    isSent: false,
    isRead: true,
    type: "document",
  },
  {
    id: "40",
    content: "I've reviewed the proposal. Looks solid!",
    timestamp: "6:30 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "41",
    content: "Great! When can you start?",
    timestamp: "6:32 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "42",
    content: "We can start next Monday. Does that work for you?",
    timestamp: "6:35 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "43",
    content: "Perfect! I'll prepare everything by Sunday",
    timestamp: "6:38 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "44",
    imageUrl: "/stylized-chat-bubbles.png",
    timestamp: "6:40 PM",
    isSent: true,
    isRead: true,
    type: "image",
  },
  {
    id: "45",
    content: "Here's the timeline and milestones",
    timestamp: "6:41 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "46",
    timestamp: "6:45 PM",
    isSent: false,
    type: "voice",
    voiceDuration: "0:08",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "47",
    content: "Looks great! I'll review it tonight",
    timestamp: "6:47 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "48",
    content: "Thanks for getting back to me so quickly",
    timestamp: "6:50 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "49",
    content: "No problem! Communication is key to success",
    timestamp: "6:52 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "50",
    content: "Absolutely agree. Talk soon!",
    timestamp: "6:55 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "51",
    content: "Talk soon! Have a great day! 😊",
    timestamp: "6:57 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "52",
    content: "You too! Thanks again for everything",
    timestamp: "7:00 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "53",
    content: "My pleasure! See you Monday! 🎉",
    timestamp: "7:02 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "54",
    imageUrl: "/stylized-chat-bubbles.png",
    timestamp: "7:05 PM",
    isSent: true,
    isRead: true,
    type: "image",
  },
  {
    id: "55",
    content: "BTW, I found a helpful resource for the project",
    timestamp: "7:06 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "56",
    content: "Oh nice! Send me the link?",
    timestamp: "7:08 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "57",
    content: "Sure, I'll email it to you along with my notes",
    timestamp: "7:10 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "58",
    content: "Perfect! Looking forward to it",
    timestamp: "7:12 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "59",
    timestamp: "7:15 PM",
    isSent: true,
    type: "voice",
    voiceDuration: "0:03",
    voiceUrl: "/sample-audio.mp3",
  },
  {
    id: "60",
    content: "Let me know if you have any questions!",
    timestamp: "7:17 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "61",
    content: "Will do! Thanks for being so helpful",
    timestamp: "7:20 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
  {
    id: "62",
    content: "That's what I'm here for! 🙌",
    timestamp: "7:22 PM",
    isSent: false,
    isRead: true,
    type: "text",
  },
  {
    id: "63",
    content: "This is the latest message in the conversation",
    timestamp: "7:25 PM",
    isSent: true,
    isRead: false,
    type: "text",
  },
]


const MESSAGES_PER_LOAD = 10

// Helper to get last N messages
const getLastNMessages = (messages: Message[], n: number) => {
  return messages.slice(-n)
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>(() => getLastNMessages(initialMessages, MESSAGES_PER_LOAD))
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
        rootMargin:"0px 0px 1000px 0px"
      },
    )


    if(sentinelRef.current){
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
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
            loadingState === "loading"
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

        {messages.map((message) => {
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
                id={message.id}
                content={message.content}
                timestamp={message.timestamp}
                isSent={message.isSent}
                isRead={message.isRead}
                type={message.type}
                imageUrl={message.imageUrl}
                voiceDuration={message.voiceDuration}
                voiceUrl={message.voiceUrl}
                documentName={message.documentName}
                documentUrl={message.documentUrl}
                replyTo={message.replyTo}
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
        })}

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

export default Index
