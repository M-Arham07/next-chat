import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LogOut, Mail, User } from "lucide-react-native";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { colors } from "../../theme/colors";
import { Button } from "../../components/ui/Button";

type Props = NativeStackScreenProps<any, "Profile">;

export function ProfileScreen({ navigation }: Props) {
    const { profile, user, signOut, loading } = useAuth();
    const [signingOut, setSigningOut] = React.useState(false);

    const handleSignOut = async () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", onPress: () => {} },
            {
                text: "Sign Out",
                onPress: async () => {
                    setSigningOut(true);
                    try {
                        await signOut();
                        navigation.replace("Login");
                    } catch (error) {
                        Alert.alert(
                            "Error",
                            error instanceof Error ? error.message : "Failed to sign out"
                        );
                    } finally {
                        setSigningOut(false);
                    }
                },
                style: "destructive",
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>
                        {profile?.username?.charAt(0).toUpperCase() || "U"}
                    </Text>
                </View>
                <Text style={styles.username}>{profile?.username || "Unknown"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                        <User size={20} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Username</Text>
                        <Text style={styles.infoValue}>{profile?.username || "Not set"}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                        <Mail size={20} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="destructive"
                    loading={signingOut}
                    disabled={signingOut}
                    icon={<LogOut size={20} color="#fff" />}
                />
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
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    avatar: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
    },
    username: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.foreground,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: colors.muted,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.foreground,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: colors.foreground,
        fontWeight: "500",
    },
});
