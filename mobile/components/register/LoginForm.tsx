import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Eye, EyeOff, ArrowLeft, XCircle } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export function LoginForm({ onBack, showBackButton }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

    // Mock API call since next-auth is web only
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), 10000);
    });
    const loginPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 3000); // Wait a bit
    });

    try {
      await Promise.race([loginPromise, timeoutPromise]);
      // Should redirect in real app
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="w-full max-w-md px-6 pb-12"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-10 z-50 items-center justify-center bg-background/80"
          >
            <ActivityIndicator size="large" color="#f5f5f5" />
            <Text className="mt-4 text-sm font-medium text-muted-foreground">
              Signing you in...
            </Text>
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
            className="mb-6 flex-row items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4"
          >
            <XCircle size={20} color="#ef4444" />
            <Text className="flex-1 text-sm font-medium text-destructive">{loginError}</Text>
            <Pressable onPress={() => setLoginError(null)}>
              <Text className="text-destructive/60 text-lg">×</Text>
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
          <Pressable onPress={onBack} className="mb-6 flex-row items-center gap-2">
            <ArrowLeft size={16} color="#a6a6a6" />
            <Text className="text-sm text-muted-foreground">Back</Text>
          </Pressable>
        </MotiView>
      )}

      {/* Header */}
      <View className="mb-8">
        <Text className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</Text>
        <Text className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</Text>
      </View>

      {/* Form */}
      <View className="space-y-4">
        {/* Email */}
        <View className="space-y-2 mb-4">
          <Text className="text-sm font-medium text-foreground">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="name@example.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
                className="h-12 rounded-xl border-border px-4 text-foreground"
              />
            )}
          />
          {errors.email && <Text className="text-xs text-destructive">{errors.email.message}</Text>}
        </View>

        {/* Password */}
        <View className="space-y-2 mb-4">
          <Text className="text-sm font-medium text-foreground">Password</Text>
          <View className="relative justify-center">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                  className="h-12 rounded-xl border-border px-4 pr-12 text-foreground"
                />
              )}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 z-10 p-2"
            >
              {showPassword ? <EyeOff size={16} color="#a6a6a6" /> : <Eye size={16} color="#a6a6a6" />}
            </Pressable>
          </View>
          {errors.password && <Text className="text-xs text-destructive">{errors.password.message}</Text>}
        </View>

        {/* Confirm Password */}
        <View className="space-y-2 mb-6">
          <Text className="text-sm font-medium text-foreground">Confirm Password</Text>
          <View className="relative justify-center">
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Confirm your password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                  className="h-12 rounded-xl border-border px-4 pr-12 text-foreground"
                />
              )}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 p-2 z-10"
            >
              {showConfirmPassword ? <EyeOff size={16} color="#a6a6a6" /> : <Eye size={16} color="#a6a6a6" />}
            </Pressable>
          </View>
          {errors.confirmPassword && <Text className="text-xs text-destructive">{errors.confirmPassword.message}</Text>}
        </View>

        {/* Submit */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-foreground h-12"
        >
          <Text className="text-sm font-medium text-background">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Text>
        </Button>
      </View>

      <View className="my-8 flex-row items-center px-4">
        <View className="flex-1 h-px bg-border" />
        <Text className="px-4 text-xs text-muted-foreground">or continue with</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      <View className="space-y-4 mb-8 gap-y-3">
        {/* Mock auth buttons */}
        <Button variant="outline" className="w-full rounded-xl h-12 border-border gap-3">
           <Text className="text-foreground font-medium">Google</Text>
        </Button>
        <Button variant="outline" className="w-full rounded-xl h-12 border-border gap-3">
           <Text className="text-foreground font-medium">Apple</Text>
        </Button>
        <Button variant="outline" className="w-full rounded-xl h-12 border-border gap-3">
           <Text className="text-foreground font-medium">GitHub</Text>
        </Button>
      </View>
    </MotiView>
  );
}
