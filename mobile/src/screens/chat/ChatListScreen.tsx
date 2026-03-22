import React, { useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Plus } from "lucide-react-native"
// Note: Import the chat app hook once fully implemented
// import { useChatApp } from "../../features/chat/hooks/use-chat-app"

export function ChatListScreen() {
  const navigation = useNavigation<any>()
  // const { threads, filteredThreads, mounted } = useChatApp()
  const [threads, setThreads] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  useEffect(() => {
    // TODO: Replace with actual useChatApp hook once implemented
    loadThreads()
  }, [])

  const loadThreads = async () => {
    setLoading(true)
    try {
      // Call Next.js API route to get threads
      // const res = await apiClient.get('/api/threads/inbox')
      // setThreads(res.data.threads)
    } catch (error) {
      console.error("[v0] Error loading threads:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderThread = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.threadItem}
      onPress={() => navigation.navigate("ChatDetail", { threadId: item.threadId, threadName: item.name })}
    >
      <View style={styles.threadContent}>
        <Text style={styles.threadName}>{item.name}</Text>
        <Text style={styles.threadPreview} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  if (loading && threads.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        renderItem={renderThread}
        keyExtractor={(item) => item.threadId}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadThreads} />}
        contentContainerStyle={threads.length === 0 ? styles.emptyContainer : undefined}
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
          // TODO: Navigate to new chat screen
          console.log("[v0] Create new chat")
        }}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  threadItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  threadContent: {
    flex: 1,
  },
  threadName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  threadPreview: {
    fontSize: 13,
    color: "#666",
  },
  badge: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
})
