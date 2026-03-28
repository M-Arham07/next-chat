import { View, Text, TextInput, Pressable } from "react-native";
import { Search, MoreVertical } from "lucide-react-native";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ThreadHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ThreadHeader({ searchQuery, onSearchChange }: ThreadHeaderProps) {
  const colors = useThemeColors();

  return (
    <View className="px-4 pt-2 pb-4">
      {/* Title Row */}
      <View className="flex-row items-center justify-between mb-4">
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.foreground }}
          >
            Chats
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
        >
          <Pressable
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.secondary }}
          >
            <MoreVertical size={20} color={colors.foreground} />
          </Pressable>
        </MotiView>
      </View>

      {/* Search Bar */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: 200 }}
      >
        <View
          className="flex-row items-center px-4 h-12 rounded-xl"
          style={{ backgroundColor: colors.secondary }}
        >
          <Search size={18} color={colors.mutedForeground} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search conversations..."
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 ml-3 text-sm"
            style={{ color: colors.foreground }}
          />
        </View>
      </MotiView>
    </View>
  );
}
