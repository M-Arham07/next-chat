"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface VoiceMessageProps {
  voiceUrl: string
}

const BAR_COUNT = 28

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function isGoodDuration(d: number) {
  return Number.isFinite(d) && d > 0 && d !== Infinity
}

export default function VoiceMessage({ voiceUrl }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bars, setBars] = useState<number[]>(Array.from({ length: BAR_COUNT }, () => 22))

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const srcConnectedRef = useRef(false)

  const stopRaf = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  const tick = () => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTime(audio.currentTime)

    const analyser = analyserRef.current
    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)

      const next = Array.from(data)
        .slice(0, BAR_COUNT)
        .map((v) => Math.max(6, (v / 255) * 34 + 6))

      const hasSignal = next.some((h) => h > 8)
      setBars(
        hasSignal
          ? next
          : Array.from({ length: BAR_COUNT }, (_, i) => 10 + ((i * 7 + Date.now() / 120) % 14)),
      )
    }

    if (!audio.paused && !audio.ended) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  const ensureAnalyser = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    if (!ctx) return

    if (ctx.state === "suspended") await ctx.resume()

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser()
      analyserRef.current.fftSize = 256
    }

    if (!srcConnectedRef.current) {
      try {
        const source = ctx.createMediaElementSource(audio)
        source.connect(analyserRef.current!)
        analyserRef.current!.connect(ctx.destination)
        srcConnectedRef.current = true
      } catch {
        analyserRef.current = null
      }
    }
  }

  const handleToggle = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      stopRaf()
      return
    }

    try {
      await ensureAnalyser()
      await audio.play()
      setIsPlaying(true)
      stopRaf()
      rafRef.current = requestAnimationFrame(tick)
    } catch (e) {
      console.error("Error playing audio:", e)
    }
  }

  // React handlers: update duration whenever browser reports it
  const syncDurationFromAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    const d = audio.duration
    if (isGoodDuration(d)) setDuration(d)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    stopRaf()
  }

  // When voiceUrl changes, force reload + try to recover duration (incl. decode fallback)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // reset UI for new audio
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    stopRaf()

    // important: forces metadata to re-evaluate
    try {
      audio.load()
    } catch {}

    // If duration stays NaN/Infinity, decode buffer to compute duration
    let cancelled = false

    ;(async () => {
      // give the browser a moment to populate metadata first
      await new Promise((r) => setTimeout(r, 80))
      if (cancelled) return
      if (isGoodDuration(audio.duration)) {
        setDuration(audio.duration)
        return
      }

      try {
        const res = await fetch(voiceUrl)
        const buf = await res.arrayBuffer()
        if (cancelled) return

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const decoded = await ctx.decodeAudioData(buf.slice(0))
        if (!cancelled) setDuration(decoded.duration || 0)
        ctx.close().catch(() => {})
      } catch {
        // if decoding fails, duration may remain 0; countdown will still work once playback progresses
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceUrl])

  useEffect(() => {
    return () => {
      stopRaf()
      try {
        audioRef.current?.pause()
      } catch {}
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      analyserRef.current = null
      srcConnectedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remaining = Math.max(0, duration - currentTime)
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-background/60 px-3 py-2 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <Avatar className="h-9 w-9 shrink-0 bg-linear-to-br from-muted to-accent ring-1 ring-border">
        <span className="text-xs font-semibold text-foreground">M</span>
      </Avatar>

      <button
        onClick={handleToggle}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-secondary/40 text-foreground shadow-xs transition hover:bg-secondary/70 active:scale-[0.98]"
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-foreground" /> : <Play className="h-5 w-5 translate-x-[1px] fill-foreground" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="relative h-10 overflow-hidden rounded-xl border bg-muted/30 px-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${progress * 100}%` }} />
          <div className="relative flex h-full items-center justify-between gap-[3px]">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-linear-to-t from-muted-foreground/60 to-primary/80 transition-[height] duration-75"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* ONLY decreasing time */}
          <span className="font-mono text-xs text-foreground/90">{formatTime(remaining)}</span>
          <span className="text-[11px] text-muted-foreground">{duration ? formatTime(duration) : "0:00"}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={voiceUrl}
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={syncDurationFromAudio}
        onLoadedData={syncDurationFromAudio}
        onDurationChange={syncDurationFromAudio}
        onCanPlay={syncDurationFromAudio}
        onCanPlayThrough={syncDurationFromAudio}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  )
}