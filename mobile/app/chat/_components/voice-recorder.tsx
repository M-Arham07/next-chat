import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useUniwind } from 'uniwind';
import { Text } from '@/components/ui/text';
import { TrashIcon, PlayIcon, PauseIcon, SendIcon } from '@/components/ui/icon';
import { useVoiceRecorder } from '@/features/chat/hooks/use-voice-recorder';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const { colors } = useUniwind();
  const { isRecording, isPaused, isStopping, durationSec, error, start, togglePause, cancel, send } =
    useVoiceRecorder(true);

  const handleDelete = () => {
    cancel();
    onCancel();
  };

  const handleSend = () => {
    send((audioBlob) => {
      onSend(audioBlob);
    });
  };

  if (error) {
    return (
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 gap-3">
        <View className="gap-1">
          <Text className="text-sm font-semibold text-foreground">{error.title}</Text>
          {error.detail && <Text className="text-xs text-muted-foreground">{error.detail}</Text>}
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => void start()}
            className="flex-1 bg-primary rounded-lg py-2 items-center"
          >
            <Text className="text-sm font-medium text-primary-foreground">Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              cancel();
              onCancel();
            }}
            className="flex-1 bg-secondary rounded-lg py-2 items-center"
          >
            <Text className="text-sm font-medium text-foreground">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
      <View className="flex-row items-center justify-between gap-4">
        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          className="w-12 h-12 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.secondary}60` }}
        >
          <TrashIcon className="w-6 h-6" color={colors.muted} />
        </TouchableOpacity>

        {/* Duration and Status */}
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-foreground tabular-nums">
            {formatDuration(durationSec)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            {isStopping ? 'Sending...' : isPaused ? 'Paused' : 'Recording...'}
          </Text>
        </View>

        {/* Pause/Resume Button */}
        <TouchableOpacity
          onPress={togglePause}
          disabled={!isRecording || isStopping}
          className="w-12 h-12 items-center justify-center rounded-full opacity-100"
          style={{
            backgroundColor: `${colors.secondary}60`,
            opacity: isRecording && !isStopping ? 1 : 0.5,
          }}
        >
          {isPaused ? (
            <PlayIcon className="w-6 h-6" color={colors.muted} />
          ) : (
            <PauseIcon className="w-6 h-6" color={colors.muted} />
          )}
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!isRecording || isStopping}
          className="w-12 h-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: colors.primary,
            opacity: isRecording && !isStopping ? 1 : 0.5,
          }}
        >
          {isStopping ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <SendIcon className="w-6 h-6" color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
