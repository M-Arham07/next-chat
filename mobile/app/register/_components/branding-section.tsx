import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";

interface BrandingSectionProps {
  showMobileButton?: boolean;
  onSignInClick?: () => void;
}

export function BrandingSection({
  showMobileButton,
  onSignInClick,
}: BrandingSectionProps) {
  const colors = useThemeColors();

  return (
    <View className="items-center">
      {/* Logo */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 600 }}
        className="mb-8"
      >
        <View
          className="w-20 h-20 rounded-2xl items-center justify-center"
          style={{ backgroundColor: colors.foreground }}
        >
          <Text
            className="text-4xl font-bold"
            style={{ color: colors.background }}
          >
            N
          </Text>
        </View>
      </MotiView>

      {/* Title */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 100 }}
      >
        <Text
          className="text-4xl font-bold text-center mb-4"
          style={{ color: colors.foreground }}
        >
          NextChat
        </Text>
      </MotiView>

      {/* Subtitle */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 200 }}
      >
        <Text
          className="text-base text-center mb-8 px-4"
          style={{ color: colors.mutedForeground }}
        >
          Connect with friends and family instantly. Secure, fast, and beautiful
          messaging.
        </Text>
      </MotiView>

      {/* Features */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 300 }}
        className="w-full mb-8"
      >
        {[
          { title: "End-to-end encryption", desc: "Your messages are secure" },
          { title: "Voice messages", desc: "Record and send voice notes" },
          { title: "Media sharing", desc: "Share photos and documents" },
        ].map((feature, index) => (
          <MotiView
            key={feature.title}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 400, delay: 400 + index * 100 }}
            className="flex-row items-center mb-4"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: colors.secondary }}
            >
              <Text style={{ color: colors.foreground }}>
                {index === 0 ? "🔒" : index === 1 ? "🎤" : "📷"}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.foreground }}
              >
                {feature.title}
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.mutedForeground }}
              >
                {feature.desc}
              </Text>
            </View>
          </MotiView>
        ))}
      </MotiView>

      {/* Sign In Button (Mobile) */}
      {showMobileButton && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 700 }}
          className="w-full"
        >
          <Pressable
            onPress={onSignInClick}
            className="w-full py-4 rounded-xl items-center active:opacity-80"
            style={{ backgroundColor: colors.foreground }}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.background }}
            >
              Get Started
            </Text>
          </Pressable>
        </MotiView>
      )}
    </View>
  );
}
