import React from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/use-theme";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  disabled = false,
  loading = false,
  variant = "default",
  size = "md",
  children,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.primary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    destructive: {
      backgroundColor: colors.destructive,
    },
  };

  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: { paddingHorizontal: 12, paddingVertical: 6 },
      text: { fontSize: 14, fontWeight: "600" },
    },
    md: {
      container: { paddingHorizontal: 16, paddingVertical: 10 },
      text: { fontSize: 16, fontWeight: "600" },
    },
    lg: {
      container: { paddingHorizontal: 20, paddingVertical: 12 },
      text: { fontSize: 18, fontWeight: "600" },
    },
  };

  const textColors: Record<ButtonVariant, string> = {
    default: colors.primaryForeground,
    outline: colors.foreground,
    ghost: colors.foreground,
    destructive: colors.destructiveForeground,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
        variantStyles[variant],
        sizeStyles[size].container,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <Text
          style={[
            {
              color: textColors[variant],
            },
            sizeStyles[size].text,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
