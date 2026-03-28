import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useChatApp } from "@/features/chat/hooks/use-chat-app";
import { ThreadHeader } from "../_components/ThreadHeader";
import { ThreadList } from "../_components/ThreadList";
import { BottomNavigation } from "../_components/layout/BottomNavigation";
import { FloatingActionButton } from "../_components/FloatingActionButton";
import { ComingSoon } from "../_components/shared/ComingSoon";
import { NavTab } from "@/features/chat/types";

export default function MobileThreadPage() {
  const colors = useThemeColors();
  const { activeTab, searchQuery, filteredThreads, set } = useChatApp();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View className="flex-1 relative">
        <AnimatePresence exitBeforeEnter>
          {activeTab === "threads" ? (
            <MotiView
              key="threads"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 150 }}
              style={{ flex: 1 }}
            >
              <ThreadHeader
                searchQuery={searchQuery}
                onSearchChange={(query: string) => set("searchQuery", query)}
              />

              <ThreadList threads={filteredThreads} />

              {/* FAB */}
              <View className="absolute right-4 bottom-24">
                <FloatingActionButton />
              </View>
            </MotiView>
          ) : (
            <MotiView
              key={activeTab}
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 150 }}
              style={{ flex: 1 }}
            >
              <ComingSoon title={activeTab} />
            </MotiView>
          )}
        </AnimatePresence>

        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab: NavTab) => set("activeTab", tab)}
        />
      </View>
    </SafeAreaView>
  );
}
