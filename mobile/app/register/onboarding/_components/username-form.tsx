import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { AtSign } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface UsernameFormProps {
  username: string;
  setUsername: (username: string) => void;
  onSave: () => void;
  isLoading: boolean;
  displayPictureSet: boolean;
}

export function UsernameForm({
  username,
  setUsername,
  onSave,
  isLoading,
  displayPictureSet,
}: UsernameFormProps) {
  const colors = useThemeColors();

  const isValid = username.trim().length >= 3 && displayPictureSet;

  return (
    <View>
      <Text
        className="text-sm font-medium mb-2"
        style={{ color: colors.foreground }}
      >
        Username
      </Text>

      <View className="relative mb-6">
        <View className="absolute left-4 top-3.5 z-10">
          <AtSign size={20} color={colors.mutedForeground} />
        </View>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          className="h-12 pl-12 pr-4 rounded-xl"
          style={{
            backgroundColor: colors.input,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.foreground,
          }}
        />
      </View>

      <Text
        className="text-xs mb-6"
        style={{ color: colors.mutedForeground }}
      >
        Username must be at least 3 characters. This is how others will find you.
      </Text>

      <Pressable
        onPress={onSave}
        disabled={!isValid || isLoading}
        className="py-4 rounded-xl items-center flex-row justify-center"
        style={{
          backgroundColor: isValid ? colors.foreground : colors.muted,
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={colors.background} />
            <Text
              className="ml-2 text-sm font-semibold"
              style={{ color: colors.background }}
            >
              Creating Profile...
            </Text>
          </>
        ) : (
          <Text
            className="text-sm font-semibold"
            style={{ color: isValid ? colors.background : colors.mutedForeground }}
          >
            Complete Setup
          </Text>
        )}
      </Pressable>
    </View>
  );
}
