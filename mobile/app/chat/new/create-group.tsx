import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUniwind } from 'uniwind';
import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useLoader } from '@/store/loader/use-loader';

/**
 * Create Group Screen
 * Set group name and finalize group creation
 */
export default function CreateGroupScreen() {
  const router = useRouter();
  const { colors } = useUniwind();
  const { setLoading } = useLoader();
  const { selectedUsers } = useLocalSearchParams<{ selectedUsers: string }>();

  const [groupName, setGroupName] = useState('');

  const parsedUsers = useMemo(() => {
    try {
      return JSON.parse(selectedUsers || '[]');
    } catch {
      return [];
    }
  }, [selectedUsers]);

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/threads', {
        name: groupName,
        participants: parsedUsers,
        isGroup: true,
      });
      return response;
    },
    onSuccess: (data) => {
      setLoading(false);
      // Navigate to new thread
      router.replace(`/chat/(threads)/${data.threadId}`);
    },
    onError: (error) => {
      setLoading(false);
      console.error('Failed to create group:', error);
    },
  });

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    await createGroupMutation.mutateAsync();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-primary text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground">
          Create Group
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Group Name Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Group Name
          </Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name..."
            placeholderTextColor={colors['muted-foreground']}
            className="px-3 py-2 rounded-lg bg-secondary text-foreground border border-border"
          />
        </View>

        {/* Members Summary */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Members ({parsedUsers.length})
          </Text>
          {parsedUsers.map((userId: string, index: number) => (
            <View
              key={userId}
              className="px-3 py-2 bg-secondary rounded-lg mb-2 flex-row items-center"
            >
              <View
                className="w-8 h-8 rounded-full mr-3"
                style={{ backgroundColor: colors.primary }}
              />
              <Text className="flex-1 text-foreground">User {index + 1}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="px-4 py-4 border-t border-border">
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || createGroupMutation.isPending}
          className="py-3 rounded-lg"
          style={{
            backgroundColor:
              groupName.trim() && !createGroupMutation.isPending
                ? colors.primary
                : colors['muted'],
          }}
        >
          {createGroupMutation.isPending ? (
            <ActivityIndicator color={colors['primary-foreground']} />
          ) : (
            <Text className="text-primary-foreground font-semibold text-center">
              Create Group
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
