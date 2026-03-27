import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { debounce } from '@/lib/debounce';

// Validation schema
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

/**
 * Username Setup Screen
 * Second step in registration after OAuth
 */
export default function UsernameScreen() {
  const router = useRouter();
  const { colors } = useUniwind();
  const { profile } = useAuth();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: '',
    },
  });

  const username = watch('username');

  // Check username availability
  const checkAvailability = useCallback(
    debounce(async (value: string) => {
      if (value.length < 3) {
        setIsAvailable(null);
        return;
      }

      setChecking(true);
      try {
        const response = await apiClient.get(`/search/users?q=${encodeURIComponent(value)}`);
        // If no results found, username is available
        setIsAvailable(!response.users?.some((u: any) => u.username === value));
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500),
    []
  );

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UsernameFormData) => {
      const response = await apiClient.put('/profiles', {
        username: data.username,
      });
      return response;
    },
    onSuccess: () => {
      // Move to avatar setup
      router.push('/register/avatar');
    },
    onError: (error) => {
      console.error('Error updating username:', error);
    },
  });

  const handleUsernameChange = (value: string) => {
    checkAvailability(value);
  };

  const onSubmit = async (data: UsernameFormData) => {
    if (!isAvailable) return;
    await updateMutation.mutateAsync(data);
  };

  // If already has username, skip to next step
  if (profile?.username) {
    router.replace('/register/avatar');
    return null;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View className="flex-1 bg-background px-4 py-8 justify-between">
        {/* Header */}
        <View>
          <Text className="text-3xl font-bold text-foreground mb-2">Choose Username</Text>
          <Text className="text-muted-foreground">
            This is how others will see you in chat
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1 justify-center">
          <Controller
            control={control}
            name="username"
            render={({ field: { value, onChange } }) => (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">Username</Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      handleUsernameChange(text);
                    }}
                    placeholder="john_doe"
                    placeholderTextColor={colors['muted-foreground']}
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-foreground border border-border"
                    autoCapitalize="none"
                    maxLength={20}
                  />
                  {checking && <ActivityIndicator className="ml-2" />}
                  {isAvailable === true && (
                    <Text className="ml-2 text-green-500">✓</Text>
                  )}
                  {isAvailable === false && (
                    <Text className="ml-2 text-destructive">✗</Text>
                  )}
                </View>

                {/* Error message */}
                {errors.username && (
                  <Text className="text-xs text-destructive mt-1">
                    {errors.username.message}
                  </Text>
                )}

                {/* Availability message */}
                {isAvailable === false && (
                  <Text className="text-xs text-destructive mt-1">
                    Username already taken
                  </Text>
                )}
                {isAvailable === true && (
                  <Text className="text-xs text-green-500 mt-1">
                    Username available
                  </Text>
                )}

                {/* Hints */}
                <Text className="text-xs text-muted-foreground mt-2">
                  3-20 characters, letters, numbers, underscores only
                </Text>
              </View>
            )}
          />
        </View>

        {/* Actions */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 py-3 rounded-lg border border-border"
            disabled={updateMutation.isPending}
          >
            <Text className="text-foreground font-semibold text-center">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={!isAvailable || updateMutation.isPending}
            className={`flex-1 py-3 rounded-lg ${
              isAvailable && !updateMutation.isPending
                ? 'bg-primary'
                : 'bg-muted'
            }`}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color={colors['primary-foreground']} />
            ) : (
              <Text className="text-primary-foreground font-semibold text-center">
                Next
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
