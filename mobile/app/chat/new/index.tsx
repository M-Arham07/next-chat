import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function StartMessagingPage() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text className="text-3xl font-bold tracking-tight">Start Messaging</Text>
      <Text className="text-center text-sm text-muted-foreground">
        Search and group creation screens are still being ported to native components.
      </Text>
      <Button variant="outline" onPress={() => router.back()}>
        <Text>Back</Text>
      </Button>
    </View>
  );
}
