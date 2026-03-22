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

type Props = NativeStackScreenProps<any, "Login">;

export function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
        if (!password) newErrors.password = "Password is required";
        return newErrors;
    };

    const handleEmailLogin = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert("Login Failed", error.message);
            }
        } catch (err) {
            Alert.alert("Error", "An error occurred during login");
            console.error("[v0] Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: "com.chatapp://oauth",
                },
            });
            if (error) throw error;
        } catch (err) {
            Alert.alert("OAuth Error", err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                    redirectTo: "com.chatapp://oauth",
                },
            });
            if (error) throw error;
        } catch (err) {
            Alert.alert("OAuth Error", err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
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

                <Button
                    title="Sign In"
                    onPress={handleEmailLogin}
                    loading={loading}
                    disabled={loading}
                />
            </View>

            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.oauthButtons}>
                <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={handleGoogleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.foreground} />
                    ) : (
                        <Text style={styles.oauthText}>Google</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={handleGitHubLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.foreground} />
                    ) : (
                        <Text style={styles.oauthText}>GitHub</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={loading}>
                    <Text style={styles.footerLink}>Sign up</Text>
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
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        color: colors.muted,
        marginHorizontal: 12,
        fontSize: 12,
    },
    oauthButtons: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 32,
    },
    oauthButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        alignItems: "center",
    },
    oauthText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.foreground,
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
