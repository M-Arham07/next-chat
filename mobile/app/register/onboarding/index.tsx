import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { OnboardingContent } from "./_components/onboarding-content";
import { AvatarUpload } from "./_components/avatar-upload";
import { UsernameForm } from "./_components/username-form";
import { useAuth } from "@/providers/AuthProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();

  const [displayPicture, setDisplayPicture] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!displayPicture) {
      setError("Please upload a display picture");
      return;
    }

    setIsLoading(true);

    try {
      // Create user API call
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_API_URL}/api/auth/create-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            image: displayPicture,
            email: user?.email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errMsg || "Failed to create user");
      }

      setSuccessMessage("Profile created successfully!");
      
      // Navigate to chat
      setTimeout(() => {
        router.replace("/chat");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background decorations */}
          <View className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5">
            <View
              className="w-full h-full rounded-full blur-3xl"
              style={{ backgroundColor: colors.primary }}
            />
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600 }}
            className="flex-1"
          >
            {/* Header Section */}
            <View className="mb-8">
              <OnboardingContent />
            </View>

            {/* Error Message */}
            {error && (
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                className="flex-row items-start p-4 mb-6 rounded-xl"
                style={{
                  backgroundColor: `${colors.destructive}15`,
                  borderWidth: 1,
                  borderColor: `${colors.destructive}30`,
                }}
              >
                <AlertCircle size={20} color={colors.destructive} />
                <Text
                  className="flex-1 ml-3 text-sm font-medium"
                  style={{ color: colors.destructive }}
                >
                  {error}
                </Text>
              </MotiView>
            )}

            {/* Success Message */}
            {successMessage && (
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                className="flex-row items-start p-4 mb-6 rounded-xl"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(34, 197, 94, 0.2)",
                }}
              >
                <CheckCircle size={20} color="#22c55e" />
                <Text className="flex-1 ml-3 text-sm font-medium text-green-600">
                  {successMessage}
                </Text>
              </MotiView>
            )}

            {/* Avatar Upload Section */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 200 }}
              className="mb-8"
            >
              <AvatarUpload
                displayPicture={displayPicture}
                setDisplayPicture={setDisplayPicture}
                setError={setError}
                setSuccess={setSuccessMessage}
              />
            </MotiView>

            {/* Username Form Section */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 300 }}
            >
              <UsernameForm
                username={username}
                setUsername={setUsername}
                onSave={handleSave}
                isLoading={isLoading}
                displayPictureSet={!!displayPicture}
              />
            </MotiView>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
