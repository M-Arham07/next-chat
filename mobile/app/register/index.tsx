import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import { BrandingSection } from "./_components/branding-section";
import { LoginForm } from "./_components/login-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function AuthScreen() {
  const [showForm, setShowForm] = useState(false);
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Theme Toggle */}
        <View className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </View>

        {/* Mobile Layout: Stack with State Toggle */}
        <AnimatePresence exitBeforeEnter>
          {!showForm ? (
            <MotiView
              key="branding"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ type: "timing", duration: 300 }}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  padding: 24,
                }}
                showsVerticalScrollIndicator={false}
              >
                <BrandingSection
                  showMobileButton
                  onSignInClick={() => setShowForm(true)}
                />
              </ScrollView>
            </MotiView>
          ) : (
            <MotiView
              key="form"
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 300 }}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  padding: 24,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  className="w-full p-6 rounded-2xl"
                  style={{ backgroundColor: colors.card }}
                >
                  <LoginForm
                    showBackButton
                    onBack={() => setShowForm(false)}
                  />
                </View>
              </ScrollView>
            </MotiView>
          )}
        </AnimatePresence>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
