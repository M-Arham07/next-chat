import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-center py-4">
      <View
        className="px-4 py-1.5 rounded-full"
        style={{ backgroundColor: colors.secondary }}
      >
        <Text
          className="text-xs font-medium"
          style={{ color: colors.mutedForeground }}
        >
          {date}
        </Text>
      </View>
    </View>
  );
}
