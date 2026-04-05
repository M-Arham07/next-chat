import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

export default function MessagesView() {
  const router = useRouter();
  const params = useLocalSearchParams<{ threadId: string }>();
  const threadId = Array.isArray(params.threadId) ? params.threadId[0] : params.threadId;

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text className="text-2xl font-semibold">Thread</Text>
      <Text className="text-center text-sm text-muted-foreground">
        Native message detail is still being ported. Selected thread: {threadId ?? "unknown"}
      </Text>
      <Button variant="outline" onPress={() => router.back()}>
        <Text>Go Back</Text>
      </Button>
    </View>
  );
}
