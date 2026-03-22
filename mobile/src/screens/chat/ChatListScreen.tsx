import React, { useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Plus } from "lucide-react-native";
import { useChatApp } from "../../features/chat/hooks/use-chat-app";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<any, "ChatList">;

export function ChatListScreen({ navigation }: Props) {
    const { threads, filteredThreads, isLoading, mounted, setSearchQuery } = useChatApp();
    const displayThreads = filteredThreads || threads || [];

    const getThreadPreview = (threadId: string) => {
        // Get last message for preview
        return "Tap to view messages";
    };

    const renderThread = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.threadItem}
            onPress={() =>
                navigation.navigate("ChatDetail", {
                    threadId: item.threadId,
                    threadName: item.type === "group" ? item.groupName : item.participants[0]?.username,
                })
            }
        >
            <View style={styles.threadContent}>
                <Text style={styles.threadName} numberOfLines={1}>
                    {item.type === "group" ? item.groupName : item.participants[0]?.username}
                </Text>
                <Text style={styles.threadPreview} numberOfLines={1}>
                    {getThreadPreview(item.threadId)}
                </Text>
            </View>
            <View style={styles.threadMeta}>
                <Text style={styles.threadTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading && displayThreads.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={displayThreads}
                renderItem={renderThread}
                keyExtractor={(item) => item.threadId}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => {}} />
                }
                contentContainerStyle={displayThreads.length === 0 ? styles.emptyContainer : undefined}
                ListEmptyComponent={
                    <View style={styles.emptyContent}>
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    navigation.navigate("NewChat");
                }}
            >
                <Plus size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    threadItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    threadContent: {
        flex: 1,
    },
    threadName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.foreground,
    },
    threadPreview: {
        fontSize: 13,
        color: colors.muted,
        marginTop: 4,
    },
    threadMeta: {
        alignItems: "flex-end",
    },
    threadTime: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flexGrow: 1,
    },
    emptyContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.foreground,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 8,
    },
});
