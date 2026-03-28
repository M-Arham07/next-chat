import { Text, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface TextMessageProps {
  content: string;
}

export function TextMessage({ content }: TextMessageProps) {
  const colors = useThemeColors();

  return (
    <View className="px-3 pt-2">
      <Text
        className="text-base leading-6"
        style={{ color: colors.foreground }}
      >
        {content}
      </Text>
    </View>
  );
}
