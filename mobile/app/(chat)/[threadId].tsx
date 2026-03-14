import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Send, Paperclip } from "lucide-react-native";
import { useChatStore, Message } from "@/lib/store/chat.store";
import { useTheme } from "@/lib/use-theme";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ThreadDetailScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { currentThread, messages, setCurrentThread, addMessage, isLoading, setLoading } =
    useChatStore();
  const [inputText, setInputText] = useState("");
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);

  const threadIdStr = threadId as string;

  useEffect(() => {
    if (threadIdStr) {
      loadThread();
    }
  }, [threadIdStr]);

  useEffect(() => {
    setThreadMessages(messages[threadIdStr] || []);
  }, [messages, threadIdStr]);

  const loadThread = async () => {
    setLoading(true);
    try {
      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 600));

      const mockThread = {
        id: threadIdStr,
        name: "John Doe",
        type: "direct" as const,
        unreadCount: 0,
        participants: ["user1", "user2"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockMessages: Message[] = [
        {
          id: "1",
          threadId: threadIdStr,
          userId: "user2",
          content: "Hey! How are you?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: "2",
          threadId: threadIdStr,
          userId: "user1",
          content: "I'm doing great, thanks for asking!",
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          read: true,
        },
        {
          id: "3",
          threadId: threadIdStr,
          userId: "user2",
          content: "That's awesome! Want to grab coffee tomorrow?",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          read: true,
        },
      ];

      setCurrentThread(mockThread);
      const store = useChatStore.getState();
      store.setMessages(threadIdStr, mockMessages);
      setThreadMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      threadId: threadIdStr,
      userId: "user1",
      content: inputText,
      timestamp: new Date().toISOString(),
      read: true,
    };

    addMessage(newMessage);
    setInputText("");
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.userId === "user1";
    const showAvatar =
      index === 0 || threadMessages[index - 1].userId !== item.userId;

    return (
      <View
        style={{
          marginBottom: 16,
          flexDirection: isCurrentUser ? "row-reverse" : "row",
          gap: 8,
          paddingHorizontal: 16,
          alignItems: "flex-end",
        }}
      >
        {showAvatar ? (
          <Avatar
            initials={isCurrentUser ? "Me" : "JD"}
            size="sm"
            colorIndex={item.userId === "user1" ? 0 : 1}
          />
        ) : (
          <View style={{ width: 32 }} />
        )}

        <View
          style={{
            maxWidth: "75%",
            backgroundColor: isCurrentUser
              ? colors.primary
              : colors.secondary,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: isCurrentUser
                ? colors.primaryForeground
                : colors.secondaryForeground,
            }}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  if (!currentThread && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.mutedForeground }}>Thread not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {currentThread?.name || "Loading..."}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {currentThread?.type === "group"
              ? `${currentThread.participants.length} members`
              : "Active now"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={threadMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{
            paddingVertical: 12,
          }}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.secondary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Paperclip size={20} color={colors.secondaryForeground} />
          </TouchableOpacity>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxHeight={100}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              fontSize: 14,
              color: colors.foreground,
              backgroundColor: colors.input,
            }}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: inputText.trim()
                ? colors.primary
                : colors.muted,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Send
              size={20}
              color={
                inputText.trim()
                  ? colors.primaryForeground
                  : colors.mutedForeground
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
