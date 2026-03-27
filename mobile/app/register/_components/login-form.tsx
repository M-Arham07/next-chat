import * as React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-react-native';
import { ProviderButton } from './provider-button';
import { signInWithOAuth } from '@/supabase/signInWithOAuth';
import { signInWithEmail, signUpWithEmail } from '@/supabase/signInWithEmail';
import { useRouter } from 'expo-router';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface LoginFormProps {
  onBack?: () => void;
}

const providers = [
  { label: 'Google' },
  { label: 'Apple' },
  { label: 'GitHub' },
];

export function LoginForm({ onBack }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const router = useRouter();

  const schema = isSignUp ? signupSchema : loginSchema;
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsLoading(true);
    setLoginError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const signupData = data as SignupFormData;
        await signUpWithEmail(signupData.email, signupData.password);
        setSuccessMessage('Account created! Check your email for a confirmation link.');
        setIsSignUp(false);
        reset();
      } else {
        const loginData = data as LoginFormData;
        await signInWithEmail(loginData.email, loginData.password);
        router.push('/(authenticated)/chat');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      bounces={false}
      className="flex-1 px-6 py-8"
    >
      <View className="flex-1 justify-center">
        {/* Back Button */}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="mb-6 flex-row items-center gap-2"
          >
            <Icon as={ArrowLeftIcon} className="h-4 w-4 text-muted-foreground" />
            <Text className="text-sm text-muted-foreground">Back</Text>
          </TouchableOpacity>
        )}

        {/* Success Message */}
        {successMessage && (
          <View className="mb-6 flex-row items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <Text className="flex-1 text-sm font-medium text-green-600 dark:text-green-400">{successMessage}</Text>
            <TouchableOpacity onPress={() => setSuccessMessage(null)}>
              <Text className="text-lg text-green-600 dark:text-green-400">×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Message */}
        {loginError && (
          <View className="mb-6 flex-row items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <Text className="flex-1 text-sm font-medium text-destructive">{loginError}</Text>
            <TouchableOpacity onPress={() => setLoginError(null)}>
              <Text className="text-lg text-destructive">×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Header */}
        <View className="mb-8">
          <Text className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account to continue'}
          </Text>
        </View>

        {/* Email Field */}
        <View className="mb-4 gap-2">
          <Text className="text-sm font-medium text-foreground">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="name@example.com"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                className="h-12 rounded-xl border border-border bg-background px-4 text-foreground placeholder-muted-foreground"
              />
            )}
          />
          {errors.email && (
            <Text className="text-xs text-destructive">{errors.email.message}</Text>
          )}
        </View>

        {/* Password Field */}
        <View className="mb-4 gap-2">
          <Text className="text-sm font-medium text-foreground">Password</Text>
          <View className="relative flex-row items-center">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter your password"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  secureTextEntry={!showPassword}
                  className="flex-1 h-12 rounded-xl border border-border bg-background px-4 pr-12 text-foreground placeholder-muted-foreground"
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4"
            >
              <Icon
                as={showPassword ? EyeOffIcon : EyeIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-xs text-destructive">{errors.password.message}</Text>
          )}
        </View>

        {/* Confirm Password Field - Only show for sign up */}
        {isSignUp && (
          <View className="mb-6 gap-2">
            <Text className="text-sm font-medium text-foreground">Confirm Password</Text>
            <View className="relative flex-row items-center">
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Confirm your password"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 h-12 rounded-xl border border-border bg-background px-4 pr-12 text-foreground placeholder-muted-foreground"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4"
              >
                <Icon
                  as={showConfirmPassword ? EyeOffIcon : EyeIcon}
                  className="h-4 w-4 text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || isLoading}
          className="mb-6 h-12 flex-row items-center justify-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-sm font-medium text-background">
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </Text>
            </>
          ) : (
            <Text className="text-sm font-medium text-background">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </Button>

        {/* Toggle Sign In / Sign Up */}
        <View className="mb-6 flex-row items-center justify-center gap-2">
          <Text className="text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => {
            setIsSignUp(!isSignUp);
            setLoginError(null);
            reset();
          }}>
            <Text className="text-sm font-medium text-foreground">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="my-6 flex-row items-center gap-4">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-xs text-muted-foreground">or continue with</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Provider Buttons */}
        <View className="gap-3">
          {providers.map((provider) => (
            <ProviderButton
              onPress={() => signInWithOAuth("google")}
              key={provider.label}
              label={provider.label}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
