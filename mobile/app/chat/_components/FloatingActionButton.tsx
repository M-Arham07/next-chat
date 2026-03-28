import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/useThemeColors";

export function FloatingActionButton() {
  const colors = useThemeColors();
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/chat/new");
  };

  return (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: 300 }}
    >
      <Pressable
        onPress={handlePress}
        className="w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95"
        style={{ backgroundColor: colors.foreground }}
      >
        <Plus size={24} color={colors.background} strokeWidth={2.5} />
      </Pressable>
    </MotiView>
  );
}
