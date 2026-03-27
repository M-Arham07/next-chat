import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import { useState, useCallback, useMemo } from 'react';
import { useChatAppStore } from '@/features/chat/store/chatapp.store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { debounce } from '@/lib/debounce';

interface SearchResult {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
}

/**
 * New Message / Search Screen
 * Find users to start conversations with
 */
export default function NewMessageScreen() {
  const router = useRouter();
  const { colors } = useUniwind();
  const { set: setStore } = useChatAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Search users query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', 'users', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const results = await apiClient.get(
        `/search/users?q=${encodeURIComponent(searchQuery)}`
      );
      return results.users || [];
    },
    enabled: searchQuery.trim().length > 0,
  });

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleStartDirectMessage = (userId: string) => {
    // TODO: Create direct thread with user via API
    // Then navigate to thread
    console.log('Starting direct message with:', userId);
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length === 0) return;
    router.push({
      pathname: '/chat/new/create-group',
      params: {
        selectedUsers: JSON.stringify(selectedUsers),
      },
    });
  };

  const renderUserItem = ({ item }: { item: SearchResult }) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        onPress={() => handleSelectUser(item.id)}
        className="px-4 py-3 border-b border-border flex-row items-center"
        activeOpacity={0.7}
      >
        {/* Avatar placeholder */}
        <View
          className="w-10 h-10 rounded-full mr-3"
          style={{ backgroundColor: colors.primary }}
        />

        {/* User info */}
        <View className="flex-1">
          <Text className="font-semibold text-foreground">
            {item.name || item.username}
          </Text>
          <Text className="text-sm text-muted-foreground">
            @{item.username}
          </Text>
        </View>

        {/* Selection indicator */}
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected ? 'bg-primary' : 'border-border'
          }`}
        >
          {isSelected && (
            <Text className="text-primary-foreground text-sm font-bold">✓</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
        <Text className="text-2xl font-bold text-foreground mb-3">
          New Message
        </Text>

        {/* Search Input */}
        <TextInput
          placeholder="Search users..."
          placeholderTextColor={colors['muted-foreground']}
          onChangeText={debouncedSearch}
          className="px-3 py-2 rounded-lg bg-secondary text-foreground"
        />
      </View>

      {/* Search Results */}
      <View className="flex-1">
        {isLoading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator />
          </View>
        ) : searchResults && searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
          />
        ) : searchQuery.length > 0 ? (
          <View className="items-center justify-center flex-1">
            <Text className="text-muted-foreground">No users found</Text>
          </View>
        ) : (
          <View className="items-center justify-center flex-1 px-4">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Search for users
            </Text>
            <Text className="text-center text-muted-foreground">
              Find someone to chat with
            </Text>
          </View>
        )}
      </View>

      {/* Selected Users & Action */}
      {selectedUsers.length > 0 && (
        <View className="px-4 py-3 border-t border-border">
          {/* Selected Users Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {selectedUsers.map((userId) => {
              const user = searchResults?.find((u) => u.id === userId);
              return (
                <View
                  key={userId}
                  className="px-3 py-1 rounded-full bg-primary mr-2 flex-row items-center"
                >
                  <Text className="text-primary-foreground text-sm mr-2">
                    {user?.username || userId}
                  </Text>
                  <TouchableOpacity onPress={() => handleSelectUser(userId)}>
                    <Text className="text-primary-foreground font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            {selectedUsers.length === 1 ? (
              <TouchableOpacity
                onPress={() => handleStartDirectMessage(selectedUsers[0])}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-primary-foreground font-semibold text-center">
                  Send Message
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleCreateGroup}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-primary-foreground font-semibold text-center">
                  Create Group ({selectedUsers.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
