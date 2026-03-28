import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { X } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Message } from "@shared/types";

interface ReplyPreviewProps {
  message: Message;
  onClose: () => void;
}

export function ReplyPreview({ message, onClose }: ReplyPreviewProps) {
  const colors = useThemeColors();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 10 }}
      transition={{ type: "timing", duration: 200 }}
      className="absolute bottom-24 left-4 right-4"
    >
      <View
        className="flex-row items-center gap-3 px-4 py-3 rounded-lg"
        style={{
          backgroundColor: colors.secondary,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
        }}
      >
        <View className="flex-1 min-w-0">
          <Text
            className="text-xs font-medium"
            style={{ color: colors.primary }}
          >
            Replying to {message.sender}
          </Text>
          <Text
            className="text-sm"
            numberOfLines={1}
            style={{ color: colors.foreground }}
          >
            {message.type === "text" ? message.content : `[${message.type}]`}
          </Text>
        </View>

        <Pressable
          onPress={onClose}
          className="p-1 rounded-full"
          style={{ backgroundColor: colors.muted }}
        >
          <X size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </MotiView>
  );
}
