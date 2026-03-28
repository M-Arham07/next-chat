import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Thread } from "@shared/types";
import { formatTime } from "@/lib/format-time";

interface ThreadItemProps {
  thread: Thread;
}

export function ThreadItem({ thread }: ThreadItemProps) {
  const colors = useThemeColors();
  const router = useRouter();

  // Get display name and image
  const displayName =
    thread.type === "group"
      ? thread.groupName || "Group Chat"
      : thread.particpants[0]?.username || "Unknown";

  const displayImage =
    thread.type === "group"
      ? thread.groupImage
      : thread.particpants[0]?.image;

  const handlePress = () => {
    router.push(`/chat/(threads)/${thread.threadId}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center px-4 py-3 active:opacity-70"
      style={{ backgroundColor: colors.background }}
    >
      {/* Avatar */}
      <View
        className="w-14 h-14 rounded-full overflow-hidden items-center justify-center mr-3"
        style={{ backgroundColor: colors.secondary }}
      >
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <Text
            className="text-xl font-semibold"
            style={{ color: colors.foreground }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-base font-semibold flex-1 mr-2"
            numberOfLines={1}
            style={{ color: colors.foreground }}
          >
            {displayName}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.mutedForeground }}
          >
            {formatTime(thread.createdAt)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text
            className="text-sm flex-1 mr-2"
            numberOfLines={1}
            style={{ color: colors.mutedForeground }}
          >
            {thread.type === "group"
              ? `${thread.particpants.length} participants`
              : "Tap to view messages"}
          </Text>

          {/* Unread Badge (placeholder) */}
          {/* <View
            className="w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.primaryForeground }}>
              2
            </Text>
          </View> */}
        </View>
      </View>
    </Pressable>
  );
}
