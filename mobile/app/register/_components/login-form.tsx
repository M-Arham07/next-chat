import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, ArrowLeft, XCircle } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ProviderButton, GoogleIcon, AppleIcon, GitHubIcon } from "./provider-button";
import { supabase } from "@/supabase/supabase-client";

const loginSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const providers = [
  { icon: GoogleIcon, label: "Google" },
  { icon: AppleIcon, label: "Apple" },
  { icon: GitHubIcon, label: "GitHub" },
];

export function LoginForm({ onBack, showBackButton }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const colors = useThemeColors();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Try to sign up if sign in fails
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (signUpError) {
          throw signUpError;
        }

        // Redirect to onboarding after signup
        router.replace("/register/onboarding");
      } else {
        // Redirect to chat after login
        router.replace("/chat");
      }
    } catch (error: any) {
      setLoginError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase() as "google" | "apple" | "github",
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setLoginError(error.message || "Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="w-full"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 items-center justify-center bg-background/80"
            style={{ borderRadius: 16 }}
          >
            <View className="items-center">
              <ActivityIndicator size="large" color={colors.foreground} />
              <Text
                className="mt-4 text-sm font-medium"
                style={{ color: colors.mutedForeground }}
              >
                Signing you in...
              </Text>
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {loginError && (
          <MotiView
            from={{ opacity: 0, translateY: -10, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -10, scale: 0.95 }}
            className="mb-6 flex-row items-center p-4 rounded-xl border"
            style={{
              backgroundColor: `${colors.destructive}20`,
              borderColor: `${colors.destructive}30`,
            }}
          >
            <XCircle size={20} color={colors.destructive} />
            <Text
              className="flex-1 ml-3 text-sm font-medium"
              style={{ color: colors.destructive }}
            >
              {loginError}
            </Text>
            <Pressable onPress={() => setLoginError(null)}>
              <Text style={{ color: colors.destructive }}>×</Text>
            </Pressable>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Back Button */}
      {showBackButton && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <Pressable
            onPress={onBack}
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={16} color={colors.mutedForeground} />
            <Text
              className="ml-2 text-sm"
              style={{ color: colors.mutedForeground }}
            >
              Back
            </Text>
          </Pressable>
        </MotiView>
      )}

      {/* Form Header */}
      <View className="mb-8">
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 100 }}
        >
          <Text
            className="text-2xl font-semibold"
            style={{ color: colors.foreground }}
          >
            Welcome back
          </Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 150 }}
        >
          <Text
            className="mt-2 text-sm"
            style={{ color: colors.mutedForeground }}
          >
            Sign in to your account to continue
          </Text>
        </MotiView>
      </View>

      {/* Form Fields */}
      <View className="gap-4">
        {/* Email Field */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 200 }}
        >
          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.foreground }}
          >
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor={colors.mutedForeground}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                className="h-12 px-4 rounded-xl"
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />
            )}
          />
          {errors.email && (
            <Text className="mt-1 text-xs" style={{ color: colors.destructive }}>
              {errors.email.message}
            </Text>
          )}
        </MotiView>

        {/* Password Field */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 250 }}
        >
          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.foreground }}
          >
            Password
          </Text>
          <View className="relative">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                  className="h-12 px-4 pr-12 rounded-xl"
                  style={{
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }}
                />
              )}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3"
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.mutedForeground} />
              ) : (
                <Eye size={20} color={colors.mutedForeground} />
              )}
            </Pressable>
          </View>
          {errors.password && (
            <Text className="mt-1 text-xs" style={{ color: colors.destructive }}>
              {errors.password.message}
            </Text>
          )}
        </MotiView>

        {/* Confirm Password Field */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 300 }}
        >
          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.foreground }}
          >
            Confirm Password
          </Text>
          <View className="relative">
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                  className="h-12 px-4 pr-12 rounded-xl"
                  style={{
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.foreground,
                  }}
                />
              )}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.mutedForeground} />
              ) : (
                <Eye size={20} color={colors.mutedForeground} />
              )}
            </Pressable>
          </View>
          {errors.confirmPassword && (
            <Text className="mt-1 text-xs" style={{ color: colors.destructive }}>
              {errors.confirmPassword.message}
            </Text>
          )}
        </MotiView>

        {/* Submit Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 350 }}
        >
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="mt-2 py-4 rounded-xl items-center active:opacity-80"
            style={{
              backgroundColor: colors.foreground,
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: colors.background }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Text>
          </Pressable>
        </MotiView>
      </View>

      {/* Divider */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 300, delay: 400 }}
        className="my-6 flex-row items-center"
      >
        <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
        <Text className="mx-4 text-xs" style={{ color: colors.mutedForeground }}>
          or continue with
        </Text>
        <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
      </MotiView>

      {/* Provider Buttons */}
      <View className="gap-3">
        {providers.map((provider, index) => (
          <ProviderButton
            key={provider.label}
            Icon={provider.icon}
            label={provider.label}
            index={index}
            onPress={() => handleProviderSignIn(provider.label)}
          />
        ))}
      </View>

      {/* Footer */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 300, delay: 800 }}
        className="mt-8"
      >
        <Text
          className="text-center text-xs"
          style={{ color: colors.mutedForeground }}
        >
          By continuing, you agree to our{" "}
          <Text className="underline" style={{ color: colors.foreground }}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text className="underline" style={{ color: colors.foreground }}>
            Privacy Policy
          </Text>
        </Text>
      </MotiView>
    </MotiView>
  );
}
