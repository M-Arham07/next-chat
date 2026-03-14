import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "@/lib/store/auth.store";
import { useTheme } from "@/lib/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const handleComplete = async () => {
    if (user) {
      setUser({ ...user });
      router.replace("/(chat)");
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Complete Your Profile
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.mutedForeground,
            }}
          >
            Step {step + 1} of 2
          </Text>
        </View>

        <Card
          style={{
            backgroundColor: colors.card,
            marginBottom: 16,
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          {step === 0 ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 12,
                    color: colors.foreground,
                  }}
                >
                  What should we call you?
                </Text>
                <Input
                  placeholder="Your display name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  containerStyle={{ marginBottom: 16 }}
                />
              </View>

              <Button
                onPress={() => setStep(1)}
                disabled={!displayName.trim()}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 12,
                    color: colors.foreground,
                  }}
                >
                  Tell us about yourself
                </Text>
                <Input
                  placeholder="Your bio (optional)"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  containerStyle={{ marginBottom: 16 }}
                />
              </View>

              <View style={{ gap: 8 }}>
                <Button
                  variant="outline"
                  onPress={() => setStep(0)}
                >
                  Back
                </Button>
                <Button onPress={handleComplete}>
                  Get Started
                </Button>
              </View>
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
