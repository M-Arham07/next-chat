import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ProviderButtonProps {
  label: 'Google' | 'Apple' | 'GitHub';
  onPress?: () => void;
}

export function ProviderButton({ label, onPress }: ProviderButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-12 flex-row items-center justify-center gap-3 rounded-xl border border-border bg-background"
      activeOpacity={0.7}
    >
      {/* Icon placeholder - replace with actual icon when available */}
      <View className="h-5 w-5 rounded-lg bg-muted" />
      <Text className="text-sm font-medium text-foreground">Continue with {label}</Text>
    </TouchableOpacity>
  );
}
