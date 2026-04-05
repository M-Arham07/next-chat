import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ReactNode } from "react";
import { View } from "react-native";
import { MotiView } from "moti";

interface ProviderButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  index?: number;
}

export function ProviderButton({ icon, label, onClick, index = 0 }: ProviderButtonProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 500 + index * 100 }}
    >
      <Button variant="outline" className="w-full flex-row items-center justify-center gap-3 rounded-xl px-4 py-3" onPress={onClick}>
        <View className="h-5 w-5 items-center justify-center">
          {icon}
        </View>
        <Text>Continue with {label}</Text>
      </Button>
    </MotiView>
  );
}

export const GoogleIcon = () => <Text className="text-sm font-semibold">G</Text>;
export const AppleIcon = () => <Text className="text-sm font-semibold">A</Text>;
export const GitHubIcon = () => <Text className="text-sm font-semibold">GH</Text>;
