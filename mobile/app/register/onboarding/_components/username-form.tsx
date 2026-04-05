import { Check } from "lucide-react-native";
import { MotiView } from "moti";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface UsernameFormProps {
  username: string;
  setUsername: (value: string) => void;
  onSave: () => void;
  isLoading: boolean;
  displayPictureSet: boolean;
}

export default function UsernameForm({
  username,
  setUsername,
  onSave,
  isLoading,
  displayPictureSet,
}: UsernameFormProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay: 200 }}
      className="gap-4"
    >
      <Label nativeID="username">Username</Label>
      <View className="gap-3">
        <Input
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          editable={!isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          className="h-12 rounded-lg border-border bg-muted/50 px-4"
        />

        <Button onPress={onSave} disabled={isLoading || !displayPictureSet || !username.trim()} className="h-12 rounded-lg">
          {isLoading ? <Text>Saving...</Text> : (
            <>
              <Check size={16} color="#F9F9F9" />
              <Text>Save Profile</Text>
            </>
          )}
        </Button>
      </View>
    </MotiView>
  );
}
