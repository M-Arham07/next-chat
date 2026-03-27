import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { getSupabaseClient } from "@/supabase/client";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const handleEmailAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/callback`
        );
        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          const code = url.searchParams.get("code");
          if (code) await supabase.auth.exchangeCodeForSession(code);
        }
      }
    } catch (err: any) {
      setError(err.message ?? "OAuth sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10 gap-y-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Branding */}
          <View className="items-center gap-y-2">
            <Text className="text-5xl">✦</Text>
            <Text className="text-4xl font-bold tracking-tight">NextChat</Text>
            <Text className="text-sm text-muted-foreground text-center">
              Fast. Private. Beautiful messaging.
            </Text>
          </View>

          {/* Card */}
          <View className="bg-card border border-border rounded-2xl p-6 gap-y-4">
            <View className="gap-y-1">
              <Text className="text-xl font-bold">
                {isSignUp ? "Create account" : "Welcome back"}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {isSignUp ? "Sign up to get started" : "Sign in to continue"}
              </Text>
            </View>

            {error ? (
              <View className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

            <View className="gap-y-1.5">
              <Text className="text-sm font-semibold">Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="gap-y-1.5">
              <Text className="text-sm font-semibold">Password</Text>
              <View className="flex-row gap-x-2">
                <Input
                  className="flex-1"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  className="h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary"
                  activeOpacity={0.7}
                >
                  <Text>{showPassword ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label={loading ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
              onPress={handleEmailAuth}
              disabled={loading}
              className="mt-1"
            />

            <View className="flex-row items-center gap-x-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted-foreground">or continue with</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <View className="flex-row gap-x-3">
              {(["google", "github"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleOAuth(p)}
                  disabled={loading}
                  activeOpacity={0.8}
                  className="flex-1 h-12 items-center justify-center rounded-xl border border-border bg-secondary"
                >
                  <Text className="text-sm font-semibold capitalize">
                    {p === "google" ? "G  Google" : "⌥  GitHub"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => { setIsSignUp((v) => !v); setError(null); }}
              className="items-center pt-1"
              activeOpacity={0.7}
            >
              <Text className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
