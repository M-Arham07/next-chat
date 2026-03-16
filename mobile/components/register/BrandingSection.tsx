import React from "react";
import { View, Text } from "react-native";
import { MotiView, MotiText } from "moti";
import { Button } from "@/components/ui/Button";

interface BrandingSectionProps {
  showMobileButton?: boolean;
  onSignInClick?: () => void;
}

const BRAND_NAME = "Next Chat";
const MOTTO = "Chatting platform, built by M-Arham07";

export function BrandingSection({ showMobileButton, onSignInClick }: BrandingSectionProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        className="w-full max-w-sm items-center py-10"
      >
        {/* Logo / Brand Mark */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
          className="mb-8 h-16 w-16 items-center justify-center rounded-2xl bg-foreground"
        >
          <Text className="text-3xl font-bold text-background">▲</Text>
        </MotiView>

        {/* Brand Name */}
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          className="text-4xl font-bold tracking-tight text-foreground"
        >
          {BRAND_NAME}
        </MotiText>

        {/* Motto */}
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 300 }}
          className="mt-4 text-center text-lg text-muted-foreground"
        >
          {MOTTO}
        </MotiText>

        {/* Mobile Sign In Button */}
        {showMobileButton && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 400 }}
            className="mt-12 w-full"
          >
            <Button
              onPress={onSignInClick}
              className="w-full rounded-xl bg-foreground py-4 h-auto"
            >
              <Text className="text-base font-medium text-background">Sign In</Text>
            </Button>
          </MotiView>
        )}
      </MotiView>
    </View>
  );
}
