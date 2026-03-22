import React, { useState } from "react";
import { TextInput as RNTextInput, View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface TextInputProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    label?: string;
    error?: string;
    editable?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    label,
    error,
    editable = true,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <RNTextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                    !editable && styles.inputDisabled,
                ]}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                editable={editable}
                placeholderTextColor={colors.mutedForeground}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.foreground,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: colors.foreground,
        backgroundColor: colors.background,
    },
    inputFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    inputDisabled: {
        backgroundColor: colors.surface,
        opacity: 0.6,
    },
    error: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
});
