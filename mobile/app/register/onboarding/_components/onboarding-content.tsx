import { View, Text } from "react-native";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";

export function OnboardingContent() {
  const colors = useThemeColors();

  return (
    <View>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
      >
        <Text
          className="text-3xl font-bold mb-3"
          style={{ color: colors.foreground }}
        >
          Complete Your Profile
        </Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 100 }}
      >
        <Text
          className="text-base leading-6"
          style={{ color: colors.mutedForeground }}
        >
          Add a profile picture and choose a username to get started. This helps
          your friends recognize you.
        </Text>
      </MotiView>
    </View>
  );
}
