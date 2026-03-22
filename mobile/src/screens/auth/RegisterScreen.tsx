import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabase";
import { TextInput } from "../../components/ui/TextInput";
import { Button } from "../../components/ui/Button";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<any, "Register">;

export function RegisterScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = () => {
        const newErrors: {
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        if (!email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";

        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
        else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        return newErrors;
    };

    const handleRegister = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert("Registration Failed", error.message);
            } else {
                Alert.alert("Success", "Check your email for verification link", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]);
            }
        } catch (err) {
            Alert.alert("Error", "An error occurred during registration");
            console.error("[v0] Register error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrors({ ...errors, email: undefined });
                    }}
                    keyboardType="email-address"
                    error={errors.email}
                    editable={!loading}
                />

                <TextInput
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrors({ ...errors, password: undefined });
                    }}
                    secureTextEntry
                    error={errors.password}
                    editable={!loading}
                />

                <TextInput
                    label="Confirm Password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    secureTextEntry
                    error={errors.confirmPassword}
                    editable={!loading}
                />

                <Button
                    title="Sign Up"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                    <Text style={styles.footerLink}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.muted,
    },
    form: {
        gap: 16,
        marginBottom: 24,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "auto",
    },
    footerText: {
        fontSize: 14,
        color: colors.muted,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
    },
});
