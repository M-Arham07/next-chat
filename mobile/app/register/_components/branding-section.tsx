import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { MotiView } from "moti";

interface BrandingSectionProps {
  showMobileButton?: boolean;
  onSignInClick?: () => void;
}

const BRAND_NAME: string = "Next Chat";
const MOTTO = "Chatting platform , built by M-Arham07";

export function BrandingSection({ showMobileButton, onSignInClick }: BrandingSectionProps) {
  return (
    <View className="items-center justify-center">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        className="items-center gap-6"
      >
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
          <Text className="text-2xl font-bold text-background">▲</Text>
        </View>

        <Text className="text-center text-4xl font-bold tracking-tight">{BRAND_NAME}</Text>
        <Text className="max-w-sm text-center text-lg text-muted-foreground">{MOTTO}</Text>

        {showMobileButton ? (
          <Button className="mt-2 w-full rounded-xl px-8 py-4" onPress={onSignInClick}>
            <Text>Sign In</Text>
          </Button>
        ) : null}
      </MotiView>
    </View>
  );
}
