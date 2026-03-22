import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface CardProps {
    children: React.ReactNode;
    style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginVertical: 8,
    },
});
