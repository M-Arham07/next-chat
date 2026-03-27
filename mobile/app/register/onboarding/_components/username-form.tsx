import * as React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, _ and -'),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

interface UsernameFormProps {
  onSubmit?: (username: string) => void;
  isLoading?: boolean;
}

export function UsernameForm({ onSubmit, isLoading }: UsernameFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
  });

  return (
    <View className="gap-6">
      {/* Username Field */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">Username</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="your_username"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              autoCapitalize="none"
              className="h-12 rounded-xl border border-border bg-background px-4 text-foreground placeholder-muted-foreground"
            />
          )}
        />
        {errors.username && (
          <Text className="text-xs text-destructive">{errors.username.message}</Text>
        )}
        <Text className="text-xs text-muted-foreground">
          3-20 characters, letters, numbers, _ and - only
        </Text>
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit((data) => onSubmit?.(data.username))}
        disabled={isSubmitting || isLoading}
        className="h-12"
      >
        <Text className="text-sm font-medium text-background">Continue</Text>
      </Button>
    </View>
  );
}
