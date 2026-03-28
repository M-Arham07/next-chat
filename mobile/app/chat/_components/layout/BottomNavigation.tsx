import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { MessageSquare, Radio, Users, Phone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { NavTab } from "@/features/chat/types";

interface NavItemProps {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: number;
  hasDot?: boolean;
  onPress?: () => void;
}

function NavItem({
  icon,
  activeIcon,
  label,
  isActive = false,
  badge,
  hasDot = false,
  onPress,
}: NavItemProps) {
  const colors = useThemeColors();

  return (
    <Pressable onPress={onPress} className="items-center py-2 px-4">
      <View className="relative">
        {isActive ? (
          <MotiView
            from={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="px-5 py-1.5 rounded-full flex-row items-center gap-2"
            style={{ backgroundColor: colors.foreground }}
          >
            {activeIcon}
            {badge && (
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.background }}
              >
                {badge}
              </Text>
            )}
          </MotiView>
        ) : (
          <View className="p-2 relative">
            {icon}
            {hasDot && (
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.foreground }}
              />
            )}
          </View>
        )}
      </View>
      <Text
        className="text-xs font-medium mt-1"
        style={{ color: isActive ? colors.foreground : colors.mutedForeground }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <MotiView
      from={{ translateY: 100 }}
      animate={{ translateY: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute bottom-0 left-0 right-0 border-t"
      style={{
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      <View className="flex-row items-center justify-around py-1">
        <NavItem
          icon={<MessageSquare size={20} color={colors.mutedForeground} />}
          activeIcon={<MessageSquare size={20} color={colors.background} />}
          label="Threads"
          isActive={activeTab === "threads"}
          badge={activeTab === "threads" ? 52 : undefined}
          onPress={() => onTabChange("threads")}
        />
        <NavItem
          icon={<Radio size={20} color={colors.mutedForeground} />}
          activeIcon={<Radio size={20} color={colors.background} />}
          label="Updates"
          isActive={activeTab === "updates"}
          hasDot={activeTab !== "updates"}
          onPress={() => onTabChange("updates")}
        />
        <NavItem
          icon={<Users size={20} color={colors.mutedForeground} />}
          activeIcon={<Users size={20} color={colors.background} />}
          label="Communities"
          isActive={activeTab === "communities"}
          onPress={() => onTabChange("communities")}
        />
        <NavItem
          icon={<Phone size={20} color={colors.mutedForeground} />}
          activeIcon={<Phone size={20} color={colors.background} />}
          label="Calls"
          isActive={activeTab === "calls"}
          onPress={() => onTabChange("calls")}
        />
      </View>

      {/* Home Indicator Bar */}
      <View className="h-1 items-center pb-2">
        <View
          className="w-32 h-1 rounded-full"
          style={{ backgroundColor: colors.mutedForeground + "50" }}
        />
      </View>
    </MotiView>
  );
}
