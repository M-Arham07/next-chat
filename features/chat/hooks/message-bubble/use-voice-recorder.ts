"use client"





/******************* IMPORTANT NOTE: ******************
 * WHILE RECORDING IN DEVELOPMENT , MIC USAGE MAY NOT STOP
 * EVEN AFTER RECORDING IS PAUSED/SENT,
 * BUT IT WORKS PERFECTLY FINE IN PRODUCTION!!!!!!!!!
 * 
 * thanks for ur attention :)
 */
import { useCallback, useEffect, useRef, useState } from "react"

export type RecorderError =
  | { title: string; detail?: string; code?: string }
  | null

export type UseVoiceRecorderReturn = {
  isRecording: boolean
  isPaused: boolean
  isStopping: boolean
  durationSec: number
  error: RecorderError

  start: () => Promise<void>
  togglePause: () => void
  cancel: () => void
  send: (onSend: (audioUrl: string, durationLabel: string) => void) => void
  resetError: () => void
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const buildError = (err: unknown): RecorderError => {
  const e = err as any
  const name = e?.name as string | undefined

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      title: "Microphone permission not granted",
      detail: "Allow microphone access in your browser settings, then try again.",
      code: name,
    }
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return { title: "No microphone found", detail: "Connect a microphone and try again.", code: name }
  }
  if (name === "NotReadableError") {
    return { title: "Microphone is busy", detail: "Close other apps using the mic and try again.", code: name }
  }
  return { title: "Could not access microphone", detail: "Try again.", code: name }
}

const hardStopStream = (s?: MediaStream | null) => {
  if (!s) return
  try {
    s.getTracks().forEach((t) => {
      try {
        t.enabled = false
      } catch {}
      try {
        t.stop()
      } catch {}
    })
  } catch {}
}

export function useVoiceRecorder(autoStart = true): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [durationSec, setDurationSec] = useState(0)
  const [error, setError] = useState<RecorderError>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setDurationSec((p) => p + 1)
    }, 1000)
  }, [stopTimer])

  const cleanup = useCallback(() => {
    stopTimer()

    const mr = mediaRecorderRef.current
    if (mr && mr.state !== "inactive") {
      try {
        mr.ondataavailable = null
        mr.onstop = null
        mr.stop()
      } catch {}
    }

    // stop mic (releases indicator)
    hardStopStream(streamRef.current)

    // extra safety: stop recorder's internal stream ref if present
    try {
      const anyMr = mr as any
      if (anyMr?.stream) hardStopStream(anyMr.stream as MediaStream)
    } catch {}

    mediaRecorderRef.current = null
    streamRef.current = null
    chunksRef.current = []

    setIsRecording(false)
    setIsPaused(false)
    setIsStopping(false)
  }, [stopTimer])

  const start = useCallback(async () => {
    // dev-safe: don’t double-acquire
    if (streamRef.current || (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive")) return

    setError(null)
    setIsStopping(false)
    setIsPaused(false)
    setDurationSec(0)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.start()
      setIsRecording(true)
      startTimer()
    } catch (err) {
      cleanup()
      setError(buildError(err))
    }
  }, [cleanup, startTimer])

  const togglePause = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || isStopping) return

    try {
      if (isPaused) {
        mr.resume()
        setIsPaused(false)
        startTimer()
      } else {
        mr.pause()
        setIsPaused(true)
        stopTimer()
      }
    } catch {}
  }, [isPaused, isStopping, startTimer, stopTimer])

  const cancel = useCallback(() => {
    cleanup()
  }, [cleanup])

  const send = useCallback(
    (onSend: (audioUrl: string, durationLabel: string) => void) => {
      const mr = mediaRecorderRef.current
      if (!mr || mr.state === "inactive" || isStopping) return

      setIsStopping(true)
      stopTimer()

      const totalSec = durationSec
      const localRecorder = mr
      const localStream: MediaStream | null = streamRef.current || (localRecorder as any).stream || null

      localRecorder.onstop = () => {
        const mime = localRecorder.mimeType || "audio/webm"
        const blob = new Blob(chunksRef.current, { type: mime })
        const url = URL.createObjectURL(blob)

        // ensure mic is off
        hardStopStream(localStream)
        hardStopStream(streamRef.current)

        mediaRecorderRef.current = null
        streamRef.current = null
        chunksRef.current = []

        setIsRecording(false)
        setIsPaused(false)
        setIsStopping(false)

        onSend(url, formatDuration(totalSec))
      }

      // flush last chunk
      try {
        localRecorder.requestData()
      } catch {}

      // stop mic ASAP for indicator
      hardStopStream(localStream)
      hardStopStream(streamRef.current)
      streamRef.current = null

      try {
        localRecorder.stop()
      } catch {
        setIsStopping(false)
      }
    },
    [durationSec, isStopping, stopTimer],
  )

  const resetError = useCallback(() => setError(null), [])

  useEffect(() => {
    if (!autoStart) return
    void start()
    return () => cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    isRecording,
    isPaused,
    isStopping,
    durationSec,
    error,
    start,
    togglePause,
    cancel,
    send,
    resetError,
  }
}
