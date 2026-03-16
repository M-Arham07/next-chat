import { useState, useRef, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export function useVoiceRecorder(debug = false) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<{ title: string; detail?: string } | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsPaused(false);
    setDurationSec(0);
    setError(null);
    setIsStopping(false);
    recordingRef.current = null;
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    totalPausedDurationRef.current = 0;
  }, [cleanup]);

  const updateDuration = useCallback(() => {
    if (!isPaused) {
      const now = Date.now();
      const elapsed = now - startTimeRef.current - totalPausedDurationRef.current;
      setDurationSec(Math.floor(elapsed / 1000));
    }
  }, [isPaused]);

  // Request permissions cleanly
  const start = useCallback(async () => {
    try {
      if (debug) console.log("[VoiceRecorder] Requesting permissions...");
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        setError({
          title: "Microphone Access Denied",
          detail: "Please enable microphone access in settings to send voice messages.",
        });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (debug) console.log("[VoiceRecorder] Starting recording...");
      resetState();
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setError(null);

      timerIntervalRef.current = setInterval(updateDuration, 1000);
    } catch (err: any) {
      if (debug) console.error("[VoiceRecorder] Error starting:", err);
      setError({ title: "Failed to Start", detail: err.message });
      resetState();
    }
  }, [debug, resetState, updateDuration]);

  const togglePause = useCallback(async () => {
    if (!recordingRef.current) return;
    try {
      if (isPaused) {
        if (debug) console.log("[VoiceRecorder] Resuming...");
        await recordingRef.current.startAsync();
        const pauseEnd = Date.now();
        totalPausedDurationRef.current += pauseEnd - pausedTimeRef.current;
        setIsPaused(false);
      } else {
        if (debug) console.log("[VoiceRecorder] Pausing...");
        await recordingRef.current.pauseAsync();
        pausedTimeRef.current = Date.now();
        setIsPaused(true);
      }
    } catch (err: any) {
      if (debug) console.error("[VoiceRecorder] Error toggling pause:", err);
    }
  }, [isPaused, debug]);

  const cancel = useCallback(async () => {
    if (debug) console.log("[VoiceRecorder] Canceling...");
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        // ignore errors on cancel
      }
    }
    resetState();
  }, [debug, resetState]);

  // Provide a callback passing an object React Native Uploads can use
  const send = useCallback(
    async (onSuccess: (audioData: { uri: string; name: string; type: string }) => void) => {
      if (!recordingRef.current || durationSec < 1) {
        if (debug) console.log("[VoiceRecorder] Recording too short or no recorder.");
        cancel();
        return;
      }

      try {
        setIsStopping(true);
        if (debug) console.log("[VoiceRecorder] Stopping and sending...");
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        cleanup();
        
        if (uri) {
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists) {
            onSuccess({
              uri: uri,
              name: `voice_message_${Date.now()}.m4a`,
              type: "audio/m4a"
            });
          }
        }
      } catch (err: any) {
        if (debug) console.error("[VoiceRecorder] Error sending:", err);
        setError({ title: "Failed to Send", detail: err.message });
      } finally {
        setIsStopping(false);
      }
    },
    [durationSec, cancel, cleanup, debug]
  );

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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
  };
}
