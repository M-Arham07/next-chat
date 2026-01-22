"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smile, Paperclip, Camera, Mic, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import VoiceRecorder from "./voice-recorder"
import { useChatApp } from "@/features/chat/hooks/use-chat-app"
import { MessageContentType } from "@/packages/shared/types"

interface ChatInputProps {
  onSend: (
    type: Omit<MessageContentType, "deleted">,
    content: string | File,
  ) => Promise<void>
}

const ChatInput = ({ onSend }: ChatInputProps) => {

  // if text content, send it only on button click/enter, 
  // if document or image, send when selected !
  // if voice, send when clicked button/enter key


  const [content, setContent] = useState<string>("")
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    // FOR TEXT MESSAGES ONLY:
    e.preventDefault()
    if (content.trim()) {
      onSend("text", content);
      setContent("");
    }
  }




  const handleRecordingSend = (audioUrl: string) => {
    onSend("voice", audioUrl);
    setIsRecording(false);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const fileType : string = file.type.startsWith("audio/")
      ? "voice"
      : file.type.startsWith("image/")
        ? "image"
        : "document"


    onSend(fileType, file);


    if (fileInputRef.current) fileInputRef.current.value = ""
  }




  if (isRecording) {
    return <VoiceRecorder onSend={handleRecordingSend} onCancel={() => setIsRecording(false)} />
  }


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
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
              onClick={() => fileInputRef.current?.click()}
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
          {content.trim().length > 0 ? (
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
              onClick={() => setIsRecording(true)}
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
