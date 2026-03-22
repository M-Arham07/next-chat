import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "destructive" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    icon,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return colors.mutedForeground;
        switch (variant) {
            case "secondary":
                return colors.surface;
            case "destructive":
                return colors.destructive;
            case "outline":
                return "transparent";
            default:
                return colors.primary;
        }
    };

    const getTextColor = () => {
        if (variant === "outline" || variant === "secondary") {
            return colors.foreground;
        }
        return "#FFFFFF";
    };

    const getPadding = () => {
        switch (size) {
            case "sm":
                return 8;
            case "lg":
                return 16;
            default:
                return 12;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    paddingVertical: getPadding(),
                    borderWidth: variant === "outline" ? 1 : 0,
                    borderColor: variant === "outline" ? colors.border : "transparent",
                },
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
});
