import { Text } from "@/components/ui/text";
import { MotiView } from "moti";

export default function OnboardingContent() {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 600, delay: 200 }}
      className="gap-6 px-4 text-center"
    >
      <Text className="text-center text-4xl font-bold tracking-tight">Create Your Username</Text>
      <Text className="text-center text-base text-muted-foreground">
        Personalize your profile and set up your account. Choose a unique username and upload a profile picture to get started on your journey.
      </Text>
    </MotiView>
  );
}
