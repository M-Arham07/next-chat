'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export type RecorderError =
  | { title: string; detail?: string; code?: string }
  | null;

export type UseVoiceRecorderReturn = {
  isRecording: boolean;
  isPaused: boolean;
  isStopping: boolean;
  durationSec: number;
  error: RecorderError;

  start: () => Promise<void>;
  togglePause: () => void;
  cancel: () => void;
  send: (onSend: (audioFile: Blob) => void) => void;
  resetError: () => void;
};

const buildError = (err: unknown): RecorderError => {
  const e = err as any;
  const name = e?.name as string | undefined;

  if (name === 'PermissionError' || name === 'NotAuthorizedError') {
    return {
      title: 'Microphone permission not granted',
      detail: 'Allow microphone access in app settings, then try again.',
      code: name,
    };
  }
  if (name === 'AudioRecordingFailedError' || name === 'NotConnectedError') {
    return {
      title: 'No microphone found',
      detail: 'Connect a microphone and try again.',
      code: name,
    };
  }
  return { title: 'Could not access microphone', detail: 'Try again.', code: name };
};

export function useVoiceRecorder(autoStart = true): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<RecorderError>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Uint8Array[]>([]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDurationSec((p) => p + 1);
    }, 1000);
  }, [stopTimer]);

  const cleanup = useCallback(() => {
    stopTimer();

    if (recordingRef.current) {
      try {
        recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.error('Error stopping recording:', e);
      }
    }

    recordingRef.current = null;
    chunksRef.current = [];

    setIsRecording(false);
    setIsPaused(false);
    setIsStopping(false);
  }, [stopTimer]);

  const start = useCallback(async () => {
    if (recordingRef.current && isRecording) return;

    setError(null);
    setIsStopping(false);
    setIsPaused(false);
    setDurationSec(0);
    chunksRef.current = [];

    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        setError({
          title: 'Microphone permission not granted',
          detail: 'Allow microphone access in app settings.',
        });
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      recordingRef.current = recording;

      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RecordingOptionsPresets.HIGH_QUALITY.android.outputFormat,
          audioEncoder: Audio.RecordingOptionsPresets.HIGH_QUALITY.android.audioEncoder,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.audioQuality,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await recording.startAsync();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      cleanup();
      setError(buildError(err));
    }
  }, [cleanup, startTimer, isRecording]);

  const togglePause = useCallback(() => {
    const recording = recordingRef.current;
    if (!recording || isStopping) return;

    try {
      if (isPaused) {
        recording.startAsync();
        setIsPaused(false);
        startTimer();
      } else {
        recording.pauseAsync();
        setIsPaused(true);
        stopTimer();
      }
    } catch (e) {
      console.error('Error toggling pause:', e);
    }
  }, [isPaused, isStopping, startTimer, stopTimer]);

  const cancel = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const send = useCallback(
    (onSend: (audioFile: Blob) => void) => {
      const recording = recordingRef.current;
      if (!recording || isStopping) return;

      setIsStopping(true);
      stopTimer();

      (async () => {
        try {
          const result = await recording.stopAndUnloadAsync();

          if (result.uri) {
            // Fetch the recorded file and convert to blob
            const response = await fetch(result.uri);
            const blob = await response.blob();

            recordingRef.current = null;
            chunksRef.current = [];

            setIsRecording(false);
            setIsPaused(false);
            setIsStopping(false);

            onSend(blob);
          }
        } catch (err) {
          console.error('Error sending recording:', err);
          setIsStopping(false);
        }
      })();
    },
    [stopTimer, isStopping]
  );

  const resetError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!autoStart) return;
    void start();
    return () => cleanup();
  }, []);

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
  };
}
