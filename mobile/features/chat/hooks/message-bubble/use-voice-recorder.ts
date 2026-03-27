import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export type RecorderError = {
  title: string;
  detail?: string;
  code?: string;
} | null;

export type UseVoiceRecorderReturn = {
  isRecording: boolean;
  isPaused: boolean;
  isStopping: boolean;
  durationSec: number;
  error: RecorderError;
  recordingUri: string | null;

  start: () => Promise<void>;
  togglePause: () => void;
  cancel: () => void;
  send: (onSend: (audioFile: File) => void) => void;
  resetError: () => void;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const buildError = (err: unknown): RecorderError => {
  const e = err as any;
  const name = e?.name as string | undefined;

  if (name === 'PermissionDenied' || e?.message?.includes('permission')) {
    return {
      title: 'Microphone permission not granted',
      detail: 'Allow microphone access in app settings, then try again.',
      code: 'PermissionDenied',
    };
  }

  if (e?.message?.includes('No recording instance')) {
    return {
      title: 'Microphone is busy',
      detail: 'Close other apps using the mic and try again.',
      code: 'DeviceBusy',
    };
  }

  return { title: 'Could not access microphone', detail: 'Try again.', code: name };
};

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<RecorderError>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const cleanup = useCallback(async () => {
    stopTimer();

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.error('Error stopping recording:', e);
      }
      recordingRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setIsStopping(false);
  }, [stopTimer]);

  const start = useCallback(async () => {
    setError(null);
    setIsStopping(false);
    setIsPaused(false);
    setDurationSec(0);
    setRecordingUri(null);

    try {
      // Request microphone permission
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        setError(buildError({ message: 'permission denied' }));
        return;
      }

      // Configure audio session for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and prepare recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      await recording.startAsync();

      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(buildError(err));
      await cleanup();
    }
  }, [cleanup, startTimer]);

  const togglePause = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      if (isPaused) {
        await recordingRef.current.resumeAsync();
        setIsPaused(false);
        startTimer();
      } else {
        await recordingRef.current.pauseAsync();
        setIsPaused(true);
        stopTimer();
      }
    } catch (err) {
      console.error('Error toggling pause:', err);
      setError(buildError(err));
    }
  }, [isPaused, startTimer, stopTimer]);

  const cancel = useCallback(async () => {
    await cleanup();
    setRecordingUri(null);
  }, [cleanup]);

  const send = useCallback(
    async (onSend: (audioFile: File) => void) => {
      if (!recordingRef.current || !isRecording) return;

      setIsStopping(true);
      stopTimer();

      try {
        const uri = await recordingRef.current.getURI();

        if (!uri) {
          setError({ title: 'Failed to get recording URI' });
          setIsStopping(false);
          return;
        }

        // Read file data
        const fileData = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert to Blob (createBlobFromBas64 helper not available, so we'll create File directly)
        const timestamp = Date.now();
        const filename = `voice-message-${timestamp}.m4a`;

        // For React Native, we need to convert base64 to a file-like object
        // We'll return a mock File object that can be uploaded
        const audioFile = {
          name: filename,
          type: 'audio/m4a',
          size: fileData.length,
          uri: uri,
          data: fileData,
        } as any;

        setRecordingUri(null);
        await cleanup();

        onSend(audioFile);
      } catch (err) {
        console.error('Error sending recording:', err);
        setError(buildError(err));
        setIsStopping(false);
      }
    },
    [isRecording, stopTimer, cleanup]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRecording,
    isPaused,
    isStopping,
    durationSec,
    error,
    recordingUri,
    start,
    togglePause,
    cancel,
    send,
    resetError,
  };
}
