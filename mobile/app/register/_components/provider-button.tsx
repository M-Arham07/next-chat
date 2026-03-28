import * as React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { signInWithOAuth } from '@/supabase/signInWithOAuth';
import { Loader2Icon } from 'lucide-react-native';

type OAuthProvider = 'google' | 'apple' | 'github';

interface ProviderButtonProps {
  label: 'Google' | 'Apple' | 'GitHub';
  onError?: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

const providerMap: Record<string, OAuthProvider> = {
  'Google': 'google',
  'Apple': 'apple',
  'GitHub': 'github',
};

export function ProviderButton({ label, onError, onLoading }: ProviderButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      onLoading?.(true);
      
      const provider = providerMap[label];
      if (!provider) {
        throw new Error(`Unknown provider: ${label}`);
      }

      await signInWithOAuth(provider);
      // If successful, the app will auto-redirect via auth state change
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} sign-in failed`;
      
      // Don't show cancellation as error (user closed browser intentionally)
      if (!message.includes('cancelled')) {
        onError?.(message);
      }
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      className="h-12 flex-row items-center justify-center gap-3 rounded-xl border border-border bg-background disabled:opacity-50"
      activeOpacity={0.7}
    >
      {isLoading ? (
        <Icon as={Loader2Icon} className="h-5 w-5 animate-spin text-foreground" />
      ) : (
        <View className="h-5 w-5 rounded-lg bg-muted" />
      )}
      <Text className="text-sm font-medium text-foreground">
        {isLoading ? `Signing in...` : `Continue with ${label}`}
      </Text>
    </TouchableOpacity>
  );
}
