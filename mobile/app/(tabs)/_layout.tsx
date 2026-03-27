import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { ChatAppProvider } from "@/features/chat/hooks/use-chat-app";
import { Text } from "@/components/ui/text";

const TABS = [
  { name: "index",       label: "Threads",     icon: "💬" },
  { name: "updates",     label: "Updates",     icon: "📡" },
  { name: "communities", label: "Communities", icon: "👥" },
  { name: "calls",       label: "Calls",       icon: "📞" },
];

function TabBarIcon({ focused, icon }: { focused: boolean; icon: string }) {
  if (focused) {
    return (
      <View className="flex-row items-center gap-x-1.5 bg-primary px-4 py-2 rounded-full">
        <Text className="text-base text-primary-foreground">{icon}</Text>
      </View>
    );
  }
  return <Text className="text-xl">{icon}</Text>;
}

function TabsLayoutInner() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "hsl(240 10% 3.9%)",
          borderTopColor: "hsl(240 3.7% 15.9%)",
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: "hsl(0 0% 98%)",
        tabBarInactiveTintColor: "hsl(240 5% 64.9%)",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <ChatAppProvider>
      <TabsLayoutInner />
    </ChatAppProvider>
  );
}
