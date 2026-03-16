import React from "react";
import { View, ViewStyle, Text } from "react-native";
import { useTheme } from "@/lib/use-theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View
      style={[
        {
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        {
          fontSize: 18,
          fontWeight: "600",
          color: colors.foreground,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardDescription({
  children,
  style,
}: CardDescriptionProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        {
          fontSize: 14,
          color: colors.mutedForeground,
          marginTop: 4,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return (
    <View
      style={[
        {
          marginVertical: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View
      style={[
        {
          marginTop: 12,
          flexDirection: "row",
          gap: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
