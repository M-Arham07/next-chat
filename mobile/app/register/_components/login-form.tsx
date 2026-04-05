import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { View, Pressable } from "react-native";
import { MotiView } from "moti";
import { Eye, EyeOff, ArrowLeft, XCircle } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ProviderButton, GoogleIcon, AppleIcon, GitHubIcon } from "./provider-button";
import { signInWithOAuth } from "@/supabase/auth/signInOAuth";
import { canUseNativeGoogleSignIn, useGoogleSignIn } from "@/supabase/auth/useGoogleSignIn";
import { createClient } from "@/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const providers = [
  { icon: <GoogleIcon />, label: "Google" },
  { icon: <AppleIcon />, label: "Apple" },
  { icon: <GitHubIcon />, label: "GitHub" },
];

export function LoginForm({ onBack, showBackButton }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const { handleGoogleSignIn } = useGoogleSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const supabase = createClient();

      if (!supabase) {
        setLoginError("Supabase is not configured.");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const { error, data } =
        mode === "sign-in"
          ? await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            })
          : await supabase.auth.signUp({
              email: normalizedEmail,
              password,
            });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (mode === "sign-up" && !data.session) {
        setLoginError("Account created. If email confirmation is enabled, verify your email and then sign in.");
      }
    } catch (_error) {
      setLoginError(mode === "sign-in" ? "Sign in failed. Please try again." : "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderPress = async (label: string) => {
    if (label === "Google") {
      if (!canUseNativeGoogleSignIn()) {
        await signInWithOAuth("google");
        return;
      }
      await handleGoogleSignIn();
      return;
    }

    if (label === "GitHub") {
      await signInWithOAuth("github");
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="w-full"
    >
      {loginError ? (
        <View className="mb-6 flex-row items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <XCircle size={20} color="#E53E3E" />
          <Text className="flex-1 text-sm font-medium text-destructive">{loginError}</Text>
          <Pressable onPress={() => setLoginError(null)}>
            <Text className="text-destructive">×</Text>
          </Pressable>
        </View>
      ) : null}

      {showBackButton ? (
        <Pressable onPress={onBack} className="mb-6 flex-row items-center gap-2">
          <ArrowLeft size={16} color="#737373" />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>
      ) : null}

      <View className="mb-8">
        <Text className="text-2xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          {mode === "sign-in" ? "Sign in to your account to continue" : "Create an account to continue"}
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Label nativeID="email" className="text-sm font-medium">Email</Label>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="name@example.com"
                className="h-12 rounded-xl border-border bg-background px-4"
              />
            )}
          />
          {errors.email ? <Text className="text-xs text-destructive">{errors.email.message}</Text> : null}
        </View>

        <View className="gap-2">
          <Label nativeID="password" className="text-sm font-medium">Password</Label>
          <View className="relative">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl border-border bg-background px-4 pr-12"
                />
              )}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
              {showPassword ? <EyeOff size={16} color="#737373" /> : <Eye size={16} color="#737373" />}
            </Pressable>
          </View>
          {errors.password ? <Text className="text-xs text-destructive">{errors.password.message}</Text> : null}
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting || isLoading} className="mt-2 h-12 rounded-xl">
          <Text>
            {isLoading || isSubmitting ? (mode === "sign-in" ? "Signing In..." : "Creating Account...") : (mode === "sign-in" ? "Sign In" : "Create Account")}
          </Text>
        </Button>
      </View>

      <View className="mt-4 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-muted-foreground">
          {mode === "sign-in" ? "Don't have an account?" : "Already have an account?"}
        </Text>
        <Pressable
          onPress={() => {
            setLoginError(null);
            setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          }}
        >
          <Text className="text-sm font-medium text-foreground">
            {mode === "sign-in" ? "Sign Up" : "Sign In"}
          </Text>
        </Pressable>
      </View>

      <View className="my-6 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text className="text-xs uppercase text-muted-foreground">or continue with</Text>
        <View className="h-px flex-1 bg-border" />
      </View>

      <View className="gap-3">
        {providers.map((provider, index) => (
          <ProviderButton
            key={provider.label}
            icon={provider.icon}
            label={provider.label}
            index={index}
            onClick={() => handleProviderPress(provider.label)}
          />
        ))}
      </View>
    </MotiView>
  );
}
