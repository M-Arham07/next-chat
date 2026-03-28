import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react-native";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ChatHeaderProps {
  name: string;
  status: "online" | "offline" | "typing";
  avatarInitial: string;
}

export function ChatHeader({ name, status, avatarInitial }: ChatHeaderProps) {
  const colors = useThemeColors();
  const router = useRouter();

  const statusText = {
    online: "Online",
    offline: "Offline",
    typing: "Typing...",
  };

  const statusColor = status === "online" ? "#22c55e" : colors.mutedForeground;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      className="flex-row items-center px-4 py-3 border-b"
      style={{ borderBottomColor: colors.border, backgroundColor: colors.card }}
    >
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        className="p-2 -ml-2 rounded-full active:opacity-70"
      >
        <ArrowLeft size={24} color={colors.foreground} />
      </Pressable>

      {/* Avatar */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center ml-2"
        style={{ backgroundColor: colors.secondary }}
      >
        <Text
          className="text-base font-semibold"
          style={{ color: colors.foreground }}
        >
          {avatarInitial}
        </Text>
      </View>

      {/* Name & Status */}
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-semibold"
          numberOfLines={1}
          style={{ color: colors.foreground }}
        >
          {name}
        </Text>
        <View className="flex-row items-center">
          {status === "online" && (
            <View
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: statusColor }}
            />
          )}
          <Text className="text-xs" style={{ color: statusColor }}>
            {statusText[status]}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-1">
        <Pressable
          className="p-2 rounded-full active:opacity-70"
          style={{ backgroundColor: colors.secondary }}
        >
          <Video size={20} color={colors.foreground} />
        </Pressable>
        <Pressable
          className="p-2 rounded-full active:opacity-70"
          style={{ backgroundColor: colors.secondary }}
        >
          <Phone size={20} color={colors.foreground} />
        </Pressable>
        <Pressable
          className="p-2 rounded-full active:opacity-70"
          style={{ backgroundColor: colors.secondary }}
        >
          <MoreVertical size={20} color={colors.foreground} />
        </Pressable>
      </View>
    </MotiView>
  );
}
