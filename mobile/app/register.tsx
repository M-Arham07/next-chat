import React, { useState } from "react";
import { View, ScrollView, SafeAreaView, Dimensions } from "react-native";
import { BrandingSection } from "@/components/register/BrandingSection";
import { LoginForm } from "@/components/register/LoginForm";
import { StatusBar } from "expo-status-bar";

export default function RegisterScreen() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { width } = Dimensions.get("window");
  
  // Responsive logic: split view on tablets/web, sliding view on mobile phones.
  const isLargeScreen = width >= 1024; // lg breakpoint

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      {isLargeScreen ? (
        // Desktop / Tablet layout: Side-by-side
        <View className="flex-1 flex-row">
          <View className="flex-1 items-center justify-center p-8 bg-zinc-950/50">
            <BrandingSection showMobileButton={false} />
          </View>
          <View className="flex-1 items-center justify-center p-8 border-l border-border bg-background">
            <LoginForm showBackButton={false} />
          </View>
        </View>
      ) : (
        // Mobile layout: Flow from branding to form via state
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-center py-10">
            {!showLoginForm ? (
              <BrandingSection
                showMobileButton={true}
                onSignInClick={() => setShowLoginForm(true)}
              />
            ) : (
              <LoginForm 
                showBackButton={true} 
                onBack={() => setShowLoginForm(false)} 
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
