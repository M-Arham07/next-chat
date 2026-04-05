import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function GlobalLoader({ className }: { className?: string }) {
  return (
    <View className={className}>
      <Text>Loading...</Text>
    </View>
  );
}
