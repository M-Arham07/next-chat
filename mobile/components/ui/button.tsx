import React from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { useTheme } from "@/lib/use-theme";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

interface ButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
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
  size = "default",
  children,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.primary,
    },
    destructive: {
      backgroundColor: colors.destructive,
    },
    outline: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    link: {
      backgroundColor: "transparent",
    },
  };

  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    default: {
      container: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36, borderRadius: 6 },
      text: { fontSize: 14, fontWeight: "500" },
    },
    sm: {
      container: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32, borderRadius: 6 },
      text: { fontSize: 13, fontWeight: "500" },
    },
    lg: {
      container: { paddingHorizontal: 24, paddingVertical: 10, minHeight: 40, borderRadius: 6 },
      text: { fontSize: 15, fontWeight: "500" },
    },
    icon: {
      container: { width: 36, height: 36, borderRadius: 6 },
      text: { fontSize: 16 },
    },
    "icon-sm": {
      container: { width: 32, height: 32, borderRadius: 5 },
      text: { fontSize: 14 },
    },
    "icon-lg": {
      container: { width: 40, height: 40, borderRadius: 6 },
      text: { fontSize: 18 },
    },
  };

  const textColors: Record<ButtonVariant, string> = {
    default: colors.primaryForeground,
    destructive: "#FFFFFF",
    outline: colors.foreground,
    secondary: colors.secondaryForeground,
    ghost: colors.foreground,
    link: colors.primary,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
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
        <ActivityIndicator color={textColors[variant]} size="small" />
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
