import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface OnboardingContentProps {
  step?: number;
  onStepChange?: (step: number) => void;
}

export function OnboardingContent({ step = 0, onStepChange }: OnboardingContentProps) {
  const steps = [
    {
      title: 'Upload your avatar',
      description: 'Choose a profile picture to personalize your account',
    },
    {
      title: 'Choose a username',
      description: 'Pick a unique username for your profile',
    },
    {
      title: 'Customize settings',
      description: 'Adjust your preferences and privacy settings',
    },
  ];

  const currentStep = steps[step] || steps[0];

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-2xl font-semibold text-foreground">
          {currentStep.title}
        </Text>
        <Text className="text-base text-muted-foreground">
          {currentStep.description}
        </Text>
      </View>

      {/* Step Indicator */}
      <View className="flex-row gap-2">
        {steps.map((_, index) => (
          <View
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index <= step ? 'bg-foreground' : 'bg-muted'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
