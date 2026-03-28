import { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, UserPlus } from "lucide-react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { useThemeColors } from "@/hooks/useThemeColors";

// Mock contacts data
const mockContacts = [
  { id: "1", username: "john_doe", name: "John Doe", image: null },
  { id: "2", username: "jane_smith", name: "Jane Smith", image: null },
  { id: "3", username: "bob_wilson", name: "Bob Wilson", image: null },
  { id: "4", username: "alice_johnson", name: "Alice Johnson", image: null },
  { id: "5", username: "charlie_brown", name: "Charlie Brown", image: null },
];

export default function NewChatPage() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contactId: string) => {
    // In a real app, this would create a new thread or navigate to existing one
    router.push(`/chat/(threads)/${contactId}`);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300 }}
        className="px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 rounded-full active:opacity-70"
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text
            className="text-xl font-bold ml-2"
            style={{ color: colors.foreground }}
          >
            New Chat
          </Text>
        </View>

        {/* Search Bar */}
        <View
          className="flex-row items-center px-4 h-12 rounded-xl"
          style={{ backgroundColor: colors.secondary }}
        >
          <Search size={18} color={colors.mutedForeground} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts..."
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 ml-3 text-sm"
            style={{ color: colors.foreground }}
            autoFocus
          />
        </View>
      </MotiView>

      {/* New Group Button */}
      <MotiView
        from={{ opacity: 0, translateX: -10 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "timing", duration: 300, delay: 100 }}
      >
        <Pressable
          className="flex-row items-center px-4 py-4 border-b active:opacity-70"
          style={{ borderBottomColor: colors.border }}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: colors.primary }}
          >
            <UserPlus size={24} color={colors.primaryForeground} />
          </View>
          <Text
            className="text-base font-semibold"
            style={{ color: colors.foreground }}
          >
            Create New Group
          </Text>
        </Pressable>
      </MotiView>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text
            className="px-4 py-3 text-xs font-semibold uppercase"
            style={{ color: colors.mutedForeground }}
          >
            Contacts
          </Text>
        }
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 200, delay: index * 50 }}
          >
            <Pressable
              onPress={() => handleSelectContact(item.id)}
              className="flex-row items-center px-4 py-3 active:opacity-70"
            >
              {/* Avatar */}
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: colors.secondary }}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: "100%", height: "100%", borderRadius: 24 }}
                  />
                ) : (
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.foreground }}
                  >
                    {item.name.charAt(0)}
                  </Text>
                )}
              </View>

              {/* Contact Info */}
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.foreground }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.mutedForeground }}
                >
                  @{item.username}
                </Text>
              </View>
            </Pressable>
          </MotiView>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text
              className="text-sm"
              style={{ color: colors.mutedForeground }}
            >
              No contacts found
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
