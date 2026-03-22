import React, { useState } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useRoute } from "@react-navigation/native"
import { Send } from "lucide-react-native"
// Note: Import the chat app hook once fully implemented
// import { useChatApp } from "../../features/chat/hooks/use-chat-app"

export function ChatDetailScreen() {
  const route = useRoute<any>()
  const { threadId } = route.params || {}
  // const { messages, handleSendMessage } = useChatApp()
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!messageText.trim()) return

    const newMessage = {
      msgId: Date.now().toString(),
      content: messageText,
      timestamp: new Date().toISOString(),
      sender: "current-user",
    }

    setMessages((prev) => [newMessage, ...prev])
    setMessageText("")

    try {
      // TODO: Call handleSendMessage from useChatApp hook
      // await handleSendMessage(threadId, 'text', messageText)
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    }
  }

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[styles.messageRow, item.sender === "current-user" && styles.sentMessage]}>
      <View
        style={[styles.messageBubble, item.sender === "current-user" && styles.sentBubble]}
      >
        <Text style={[styles.messageText, item.sender === "current-user" && styles.sentText]}>
          {item.content}
        </Text>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.msgId}
        inverted
        contentContainerStyle={messages.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!messageText.trim()}>
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  messageRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "flex-start",
  },
  sentMessage: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  sentBubble: {
    backgroundColor: "#3b82f6",
  },
  messageText: {
    fontSize: 14,
    color: "#000",
  },
  sentText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: "#000",
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
})
