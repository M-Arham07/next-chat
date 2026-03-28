import { View, Text, FlatList } from "react-native";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ThreadItem } from "./ThreadItem";
import { Thread } from "@shared/types";

interface ThreadListProps {
  threads: Thread[] | null;
}

export function ThreadList({ threads }: ThreadListProps) {
  const colors = useThemeColors();

  if (!threads || threads.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 300 }}
        className="flex-1 items-center justify-center px-4"
      >
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: colors.secondary }}
        >
          <Text className="text-2xl">💬</Text>
        </View>
        <Text
          className="text-sm text-center"
          style={{ color: colors.mutedForeground }}
        >
          No conversations found
        </Text>
        <Text
          className="text-xs text-center mt-2"
          style={{ color: colors.mutedForeground }}
        >
          Start a new chat to begin messaging
        </Text>
      </MotiView>
    );
  }

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.threadId}
      renderItem={({ item, index }) => (
        <MotiView
          from={{ opacity: 0, translateX: -10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 200, delay: index * 30 }}
        >
          <ThreadItem thread={item} />
        </MotiView>
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
