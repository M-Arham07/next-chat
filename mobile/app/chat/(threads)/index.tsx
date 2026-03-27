import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import { useChatApp } from '@/features/chat/hooks/use-chat-app';
import { useLoader } from '@/store/loader/use-loader';
import { Thread } from '@chat/shared';
import { useMemo } from 'react';

/**
 * Threads List Screen
 * Displays inbox of all conversations
 * Main entry point for chat experience
 */
export default function ThreadsScreen() {
  const router = useRouter();
  const { colors } = useUniwind();
  const { loading } = useLoader();
  const {
    threads,
    messages,
    searchQuery,
    activeFilter,
    filteredThreads,
    set,
  } = useChatApp();

  // Use filtered threads if searching/filtering, otherwise show all
  const displayThreads = useMemo(() => {
    return filteredThreads || threads;
  }, [filteredThreads, threads]);

  const handleNewMessage = () => {
    router.push('/chat/new');
  };

  const handleThreadPress = (threadId: string) => {
    router.push(`/chat/(threads)/${threadId}`);
  };

  const renderThreadItem = ({ item }: { item: Thread }) => {
    const threadMessages = messages[item.id] || [];
    const lastMessage = threadMessages[threadMessages.length - 1];
    const unreadCount = threadMessages.filter((m) => !m.read).length;

    return (
      <TouchableOpacity
        onPress={() => handleThreadPress(item.id)}
        className="px-4 py-3 border-b border-border flex-row items-center"
        activeOpacity={0.7}
      >
        {/* Avatar placeholder */}
        <View
          className="w-10 h-10 rounded-full mr-3"
          style={{ backgroundColor: colors.primary }}
        />

        {/* Thread info */}
        <View className="flex-1">
          <Text className="font-semibold text-foreground">
            {item.name || 'Unknown'}
          </Text>
          <Text className="text-sm text-muted-foreground truncate">
            {lastMessage?.content || 'No messages yet'}
          </Text>
        </View>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <View
            className="px-2 py-1 rounded-full ml-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-xs text-primary-foreground font-semibold">
              {unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="text-lg font-semibold text-foreground mb-2">
        No conversations yet
      </Text>
      <Text className="text-center text-muted-foreground mb-4">
        Start a new conversation to begin chatting
      </Text>
      <TouchableOpacity
        onPress={handleNewMessage}
        className="px-4 py-2 rounded-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-primary-foreground font-semibold">
          Start Messaging
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Messages</Text>
        <TouchableOpacity
          onPress={handleNewMessage}
          className="p-2"
        >
          <Text className="text-primary">+</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Filter Bar */}
      <View className="px-4 py-2">
        <View className="flex-row gap-2">
          {['all', 'unread', 'groups'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => set('activeFilter', filter as any)}
              className={`px-3 py-1 rounded-full ${
                activeFilter === filter
                  ? 'bg-primary'
                  : 'bg-secondary'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter
                    ? 'text-primary-foreground'
                    : 'text-secondary-foreground'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Threads List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : displayThreads && displayThreads.length > 0 ? (
        <FlatList
          data={displayThreads}
          renderItem={renderThreadItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}
