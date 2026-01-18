"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smile, Paperclip, Camera, Mic, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import VoiceRecorder from "./voice-recorder"

interface ChatInputProps {
  onSend: (
    message: string,
    type?: string,
    audioUrl?: string,
    duration?: string,
    fileData?: { name: string; url: string; type: string },
  ) => void
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message)
      setMessage("")
    }
  }

  const handleMicClick = () => setIsRecording(true)
  const handleRecordingCancel = () => setIsRecording(false)
  const handleRecordingSend = (audioUrl: string, duration: string) => {
    onSend("", "voice", audioUrl, duration)
    setIsRecording(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string
        const fileType = file.type.startsWith("audio/")
          ? "voice"
          : file.type.startsWith("image/")
            ? "image"
            : "document"

        if (fileType === "image") {
          onSend("", "image", fileUrl)
        } else if (fileType === "voice") {
          const audio = new Audio(fileUrl)
          audio.onloadedmetadata = () => {
            const minutes = Math.floor(audio.duration / 60)
            const seconds = Math.floor(audio.duration % 60)
            const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`
            onSend("", "voice", fileUrl, duration)
          }
        } else {
          onSend("", "document", undefined, undefined, { name: file.name, url: fileUrl, type: file.type })
        }
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAttachmentClick = () => fileInputRef.current?.click()

  if (isRecording) {
    return <VoiceRecorder onSend={handleRecordingSend} onCancel={handleRecordingCancel} />
  }

  const hasContent = message.trim().length > 0

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        fixed md:absolute bottom-0 left-0 right-0 z-50
        p-3 backdrop-blur-xl bg-background/80 border-t border-glass-border
        pb-[max(env(safe-area-inset-bottom),0.75rem)]
      "
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button type="button" className="p-2 rounded-full hover:bg-secondary transition-colors flex-shrink-0">
          <Smile className="w-6 h-6 text-muted-foreground" />
        </button>

        <div className="flex-1 relative min-w-0">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="w-full bg-secondary/50 border-glass-border rounded-full pl-4 pr-20 py-6 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30 backdrop-blur-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <button type="button" className="p-2 rounded-full hover:bg-accent transition-colors">
              <Camera className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {hasContent ? (
            <motion.button
              key="send"
              type="submit"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              type="button"
              onClick={handleMicClick}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}

export default ChatInput
