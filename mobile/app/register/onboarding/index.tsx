import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Onboarding Screen
 * Welcome screen after avatar setup
 * Shows tips and features before entering chat
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useUniwind();
  const { profile } = useAuth();

  const handleStartChatting = () => {
    router.replace('/chat');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header with Welcome */}
        <View className="px-4 py-8 items-center">
          {profile?.image && (
            <Image
              source={{ uri: profile.image }}
              className="w-20 h-20 rounded-full mb-4"
            />
          )}
          <Text className="text-3xl font-bold text-foreground mb-2">
            Welcome, {profile?.username || 'User'}!
          </Text>
          <Text className="text-center text-muted-foreground">
            You're all set. Let's start chatting!
          </Text>
        </View>

        {/* Features Overview */}
        <View className="px-4 py-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Here's what you can do:
          </Text>

          {/* Feature Item 1 */}
          <View className="flex-row mb-4 items-start">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-primary-foreground">💬</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground mb-1">
                Send Messages
              </Text>
              <Text className="text-sm text-muted-foreground">
                Chat with individuals or create group conversations
              </Text>
            </View>
          </View>

          {/* Feature Item 2 */}
          <View className="flex-row mb-4 items-start">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-primary-foreground">📸</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground mb-1">
                Share Media
              </Text>
              <Text className="text-sm text-muted-foreground">
                Send photos, videos, documents, and voice messages
              </Text>
            </View>
          </View>

          {/* Feature Item 3 */}
          <View className="flex-row mb-4 items-start">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-primary-foreground">✍️</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground mb-1">
                Typing Indicators
              </Text>
              <Text className="text-sm text-muted-foreground">
                See when someone is typing in real-time
              </Text>
            </View>
          </View>

          {/* Feature Item 4 */}
          <View className="flex-row mb-4 items-start">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-primary-foreground">🔔</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground mb-1">
                Stay Updated
              </Text>
              <Text className="text-sm text-muted-foreground">
                Get notified of new messages and replies
              </Text>
            </View>
          </View>

          {/* Feature Item 5 */}
          <View className="flex-row items-start">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-primary-foreground">🔒</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground mb-1">
                Secure & Private
              </Text>
              <Text className="text-sm text-muted-foreground">
                Your conversations are private and secure
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View className="px-4 py-6 bg-secondary rounded-lg mx-4 mb-8">
          <Text className="text-sm font-semibold text-foreground mb-2">
            💡 Pro Tips:
          </Text>
          <Text className="text-xs text-muted-foreground mb-1">
            • Tap the + button to start a new conversation
          </Text>
          <Text className="text-xs text-muted-foreground mb-1">
            • Use filters to organize your messages (All, Unread, Groups)
          </Text>
          <Text className="text-xs text-muted-foreground">
            • Long-press messages to see more options
          </Text>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="px-4 py-4 border-t border-border">
        <TouchableOpacity
          onPress={handleStartChatting}
          className="py-3 rounded-lg"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-primary-foreground font-semibold text-center text-lg">
            Start Chatting
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
