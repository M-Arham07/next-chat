import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

interface BrandingSectionProps {
  onSignInClick?: () => void;
}

const BRAND_NAME = 'Next Chat';
const MOTTO = 'Chatting platform, built by M-Arham07';

export function BrandingSection({ onSignInClick }: BrandingSectionProps) {
  return (
    <View className="flex-1 items-center justify-center gap-8 px-6 py-12">
      {/* Logo / Brand Mark */}
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
        <Text className="text-2xl font-bold text-background">▲</Text>
      </View>

      {/* Brand Name */}
      <Text className="text-4xl font-bold tracking-tight text-foreground">
        {BRAND_NAME}
      </Text>

      {/* Motto */}
      <Text className="max-w-sm text-center text-lg text-muted-foreground">
        {MOTTO}
      </Text>

      {/* Sign In Button */}
      <Button onPress={onSignInClick} className="mt-4 w-full">
        <Text className="text-base font-medium">Sign In</Text>
      </Button>

      {/* Decorative divider with text */}
      <View className="my-8 w-full items-center gap-2">
        <View className="h-px w-full bg-border" />
        <Text className="text-xs text-muted-foreground">Trusted by developers worldwide</Text>
        <View className="flex-row gap-6">
          <Text className="text-xs font-medium text-muted-foreground">Vercel</Text>
          <Text className="text-xs font-medium text-muted-foreground">Stripe</Text>
          <Text className="text-xs font-medium text-muted-foreground">Linear</Text>
        </View>
      </View>
    </View>
  );
}
