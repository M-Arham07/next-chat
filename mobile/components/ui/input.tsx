import React from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { useTheme } from "@/lib/use-theme";

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input = React.forwardRef<RNTextInput, InputProps>(
  ({ label, error, containerStyle, placeholderTextColor, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <View style={containerStyle}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 6,
              color: colors.foreground,
            }}
          >
            {label}
          </Text>
        )}
        <RNTextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor || colors.mutedForeground}
          style={{
            borderWidth: 1,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 16,
            color: colors.foreground,
            backgroundColor: "transparent",
            minHeight: 36,
          }}
          {...props}
        />
        {error && (
          <Text
            style={{
              fontSize: 12,
              color: colors.destructive,
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
