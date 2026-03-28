import { View, Text } from "react-native";
import { MotiView } from "moti";
import { Construction } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="items-center"
      >
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: colors.secondary }}
        >
          <Construction size={40} color={colors.mutedForeground} />
        </View>

        <Text
          className="text-2xl font-bold text-center mb-2"
          style={{ color: colors.foreground }}
        >
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </Text>

        <Text
          className="text-base text-center"
          style={{ color: colors.mutedForeground }}
        >
          This feature is coming soon. Stay tuned for updates!
        </Text>
      </MotiView>
    </View>
  );
}
