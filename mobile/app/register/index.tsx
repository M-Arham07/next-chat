import { GlassView } from "@/components/ui/glass-view";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LoginForm } from "./_components/login-form";
import { MotiView } from "moti";
import { View } from "react-native";

export default function Auth() {
  return (
    <View className="flex-1 bg-background">
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ type: "timing", duration: 1000 }}
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-muted"
      />
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ type: "timing", duration: 1000, delay: 200 }}
        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-muted"
      />

      <View className="absolute right-4 top-14 z-10">
        <ThemeToggle />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <GlassView className="w-full max-w-md rounded-3xl p-6">
          <LoginForm />
        </GlassView>
      </View>
    </View>
  );
}
