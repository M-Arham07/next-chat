import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Send, Plus } from "lucide-react-native";
import { useChatApp } from "../../features/chat/hooks/use-chat-app";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<any, "ChatDetail">;

export function ChatDetailScreen({ route }: Props) {
    const { threadId } = route.params || {};
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);

    const { messages, threads, handleSendMessage, handleTyping } = useChatApp();
    const { profile } = useAuth();

    const threadMessages = messages?.[threadId] || [];
    const thread = threads?.find((t) => t.threadId === threadId);

    const renderMessage = ({ item }: { item: any }) => {
        const isOwn = item.sender === profile?.id;

        return (
            <View style={[styles.messageRow, isOwn && styles.ownMessage]}>
                <View
                    style={[
                        styles.messageBubble,
                        isOwn ? styles.ownBubble : styles.otherBubble,
                    ]}
                >
                    {item.type === "text" ? (
                        <Text
                            style={[
                                styles.messageText,
                                isOwn && styles.ownText,
                            ]}
                        >
                            {item.content}
                        </Text>
                    ) : (
                        <View>
                            <Text
                                style={[
                                    styles.messageText,
                                    isOwn && styles.ownText,
                                ]}
                            >
                                [{item.type.toUpperCase()}]
                            </Text>
                            <Text
                                style={[
                                    styles.messageSubtext,
                                    isOwn && styles.ownSubtext,
                                ]}
                            >
                                {item.content}
                            </Text>
                        </View>
                    )}
                </View>
                <Text
                    style={[
                        styles.timestamp,
                        isOwn && styles.ownTimestamp,
                    ]}
                >
                    {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
        );
    };

    const handleSend = async () => {
        if (!messageText.trim()) return;

        setSending(true);
        try {
            await handleSendMessage(threadId, "text", messageText);
            setMessageText("");
        } catch (error) {
            console.error("[v0] Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <FlatList
                data={threadMessages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.msgId}
                inverted
                contentContainerStyle={styles.messagesContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>
                            Start the conversation
                        </Text>
                    </View>
                }
            />

            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachButton}>
                    <Plus size={20} color={colors.primary} />
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.mutedForeground}
                    value={messageText}
                    onChangeText={(text) => {
                        setMessageText(text);
                        handleTyping(threadId);
                    }}
                    multiline
                    maxLength={1000}
                    editable={!sending}
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!messageText.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!messageText.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Send size={20} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    messagesContainer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    messageRow: {
        marginVertical: 4,
        flexDirection: "row",
        alignItems: "flex-end",
    },
    ownMessage: {
        justifyContent: "flex-end",
    },
    messageBubble: {
        maxWidth: "80%",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    ownBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        color: colors.foreground,
    },
    ownText: {
        color: "#FFFFFF",
    },
    messageSubtext: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 4,
    },
    ownSubtext: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    timestamp: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginHorizontal: 8,
    },
    ownTimestamp: {
        color: colors.mutedForeground,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.foreground,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 8,
    },
    attachButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.surface,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
        color: colors.foreground,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primaryLight,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
