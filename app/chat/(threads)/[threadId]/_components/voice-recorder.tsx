"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, Play, Pause, Send } from "lucide-react"

interface VoiceRecorderProps {
  onSend: (audioUrl: string, duration: string) => void
  onCancel: () => void
}

const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null)
  const javascriptNode = useRef<ScriptProcessorNode | null>(null)

  useEffect(() => {
    startRecording()

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      // Setup audio visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphone.current = audioContextRef.current.createMediaStreamSource(stream)
      javascriptNode.current = audioContextRef.current.createScriptProcessor(4096, 1, 1)

      microphone.current.connect(javascriptNode.current)
      javascriptNode.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      onCancel()
    }
  }

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        streamRef.current?.getTracks().forEach((track) => (track.enabled = true))
        mediaRecorderRef.current.resume()
        timerIntervalRef.current = setInterval(() => {
          setDuration((prev) => prev + 1)
        }, 1000)
        setIsPaused(false)
      } else {
        streamRef.current?.getTracks().forEach((track) => (track.enabled = false))
        mediaRecorderRef.current.pause()
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        setIsPaused(true)
      }
    }
  }

  const handleDelete = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    onCancel()
  }

  const handleSend = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

        // In a real app, you'd upload the blob to a server
        onSend(audioUrl, durationStr)
      }
    }

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-xl bg-background/80 border-t border-glass-border"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex-shrink-0"
        >
          <Trash2 className="w-6 h-6 text-muted-foreground" />
        </motion.button>

        {/* Center Content - Timer and Waveform */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="text-2xl font-bold text-foreground tabular-nums">{formatDuration(duration)}</div>

          {/* Animated Waveform */}
          <div className="flex items-center justify-center gap-1 h-8">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-muted-foreground rounded-full"
                animate={{
                  height: isRecording && !isPaused ? [4, 20, 4] : 4,
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Status Text */}
          <div className="text-xs text-muted-foreground">{isPaused ? "Paused" : "Recording..."}</div>
        </div>

        {/* Pause/Play Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePause}
          className="p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex-shrink-0"
        >
          {isPaused ? (
            <Play className="w-6 h-6 text-muted-foreground" />
          ) : (
            <Pause className="w-6 h-6 text-muted-foreground" />
          )}
        </motion.button>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Send className="w-6 h-6" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default VoiceRecorder
