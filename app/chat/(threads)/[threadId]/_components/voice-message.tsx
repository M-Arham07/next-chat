"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface VoiceMessageProps {
  voiceUrl: string
  voiceDuration: string
}

const VoiceMessage = ({ voiceUrl, voiceDuration }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const updateWaveform = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const normalized = Array.from(dataArray)
      .slice(0, 25)
      .map((value) => (value / 255) * 100)

    setWaveformData(normalized.length > 0 ? normalized : Array(25).fill(Math.random() * 100))

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform)
    }
  }

  const handlePlayVoice = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      } else {
        try {
          if (!audioContextRef.current) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            audioContextRef.current = audioContext

            if (audioContext.state === "suspended") {
              await audioContext.resume()
            }

            try {
              const source = audioContext.createMediaElementAudioSource(audioRef.current)
              const analyser = audioContext.createAnalyser()
              analyser.fftSize = 256
              analyserRef.current = analyser

              source.connect(analyser)
              analyser.connect(audioContext.destination)
            } catch (error) {
              console.log("[v0] Using existing audio source")
            }
          }

          await audioRef.current.play()
          setIsPlaying(true)
          updateWaveform()
        } catch (error) {
          console.error("[v0] Error playing audio:", error)
        }
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const remainingTime = duration - currentTime

  return (
    <div className="flex items-center gap-3 px-4 py-3 min-w-[220px]">
      <Avatar className="w-8 h-8 bg-gradient-to-br from-muted to-accent flex-shrink-0">
        <span className="text-xs font-medium text-foreground">M</span>
      </Avatar>
      <button
        onClick={handlePlayVoice}
        className="p-1 rounded-full hover:bg-secondary/50 transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-foreground fill-foreground" />
        ) : (
          <Play className="w-5 h-5 text-foreground fill-foreground" />
        )}
      </button>
      <div className="flex-1 flex items-center gap-1 h-8">
        {(waveformData.length > 0 ? waveformData : Array(25).fill(20)).map((value, i) => (
          <div
            key={i}
            className="w-0.5 bg-gradient-to-t from-muted-foreground to-primary rounded-full transition-all duration-75"
            style={{ height: `${Math.max(4, value)}px` }}
          />
        ))}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs text-foreground font-medium">{formatTime(currentTime)}</span>
        <span className="text-[9px] text-muted-foreground">{formatTime(remainingTime)}</span>
      </div>
      {voiceUrl && <audio ref={audioRef} src={voiceUrl} preload="metadata" crossOrigin="anonymous" />}
    </div>
  )
}

export default VoiceMessage
