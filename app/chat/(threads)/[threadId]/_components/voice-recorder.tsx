"use client"

import { motion } from "framer-motion"
import { Trash2, Play, Pause, Send, X, RefreshCcw } from "lucide-react"
import { useVoiceRecorder } from "@/features/chat/hooks/message-bubble/use-voice-recorder"

interface VoiceRecorderProps {
  onSend: (audioUrl: string, duration: string) => void
  onCancel: () => void
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const { isRecording, isPaused, isStopping, durationSec, error, start, togglePause, cancel, send } =
    useVoiceRecorder(true)

  const handleDelete = () => {
    cancel()
    onCancel()
  }

  const handleSend = () => {
    send((url, durationLabel) => onSend(url, durationLabel))
  }

  if (error) {
    return (
      <div className="fixed md:absolute bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-xl bg-background/80 border-t border-glass-border pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{error.title}</p>
            {error.detail && <p className="text-xs text-muted-foreground mt-1">{error.detail}</p>}
          </div>

          <button
            type="button"
            onClick={() => {
              cancel()
              onCancel()
            }}
            className="p-2 rounded-full hover:bg-secondary transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => void start()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>

          <button
            type="button"
            onClick={() => {
              cancel()
              onCancel()
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-secondary/60 hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed md:absolute bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-xl bg-background/80 border-t border-glass-border pb-[max(env(safe-area-inset-bottom),0.75rem)]"
    >
      <div className="flex items-center justify-between gap-4">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex-shrink-0"
          aria-label="Delete recording"
        >
          <Trash2 className="w-6 h-6 text-muted-foreground" />
        </motion.button>

        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="text-2xl font-bold text-foreground tabular-nums">{formatDuration(durationSec)}</div>
          <div className="text-xs text-muted-foreground">
            {isStopping ? "Sending..." : isPaused ? "Paused" : "Recording..."}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePause}
          disabled={!isRecording || isStopping}
          className="p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          aria-label={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play className="w-6 h-6 text-muted-foreground" /> : <Pause className="w-6 h-6 text-muted-foreground" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!isRecording || isStopping}
          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Send recording"
        >
          <Send className="w-6 h-6" />
        </motion.button>
      </div>
    </motion.div>
  )
}
