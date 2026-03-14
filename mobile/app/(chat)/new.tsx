import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, X, Search } from "lucide-react-native";
import { useTheme } from "@/lib/use-theme";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function NewConversationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user list
  const mockUsers: User[] = [
    { id: "u1", name: "Alice Johnson", email: "alice@example.com" },
    { id: "u2", name: "Bob Smith", email: "bob@example.com" },
    { id: "u3", name: "Carol Davis", email: "carol@example.com" },
    { id: "u4", name: "David Wilson", email: "david@example.com" },
    { id: "u5", name: "Eve Martinez", email: "eve@example.com" },
  ];

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !selectedUsers.find((su) => su.id === user.id)
    );
  }, [searchQuery, selectedUsers]);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const existing = prev.find((u) => u.id === user.id);
      if (existing) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In real app, this would create thread and navigate to it
      router.replace("/(chat)");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some((u) => u.id === item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleUserSelection(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          backgroundColor: isSelected ? colors.secondary : "transparent",
          opacity: isSelected ? 1 : 1,
        }}
      >
        <Avatar
          initials={item.name.split(" ").map((n) => n[0]).join("")}
          size="md"
          colorIndex={parseInt(item.id.replace("u", ""))}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: colors.foreground,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {item.email}
          </Text>
        </View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isSelected && (
            <Text
              style={{
                color: colors.primaryForeground,
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              ✓
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          New Conversation
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.input,
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={20} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              paddingHorizontal: 8,
              paddingVertical: 10,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.mutedForeground,
              marginBottom: 8,
            }}
          >
            Selected ({selectedUsers.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {selectedUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => toggleUserSelection(user)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.secondaryForeground,
                    fontWeight: "500",
                  }}
                  numberOfLines={1}
                >
                  {user.name.split(" ")[0]}
                </Text>
                <X size={16} color={colors.secondaryForeground} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Separator style={{ marginVertical: 12 }} />
        </View>
      )}

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <Separator style={{ marginVertical: 0, marginHorizontal: 16 }} />
        )}
        ListEmptyComponent={
          searchQuery ? (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 32,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.mutedForeground,
                }}
              >
                No users found
              </Text>
            </View>
          ) : null
        }
      />

      {/* Action Button */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          onPress={handleCreateConversation}
          disabled={selectedUsers.length === 0 || isLoading}
          loading={isLoading}
        >
          {selectedUsers.length === 1
            ? "Start Direct Message"
            : selectedUsers.length > 1
              ? "Create Group"
              : "Select users to continue"}
        </Button>
      </View>
    </SafeAreaView>
  );
}
