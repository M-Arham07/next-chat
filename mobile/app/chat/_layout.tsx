import { Stack } from 'expo-router';

/**
 * Chat flow layout
 * Main chat experience routes
 */
export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {/* Main threads/inbox view */}
      <Stack.Screen name="(threads)" />

      {/* Individual thread messages */}
      <Stack.Screen
        name="(threads)/[threadId]"
        options={{
          presentation: 'card',
        }}
      />

      {/* New thread/search users */}
      <Stack.Screen
        name="new"
        options={{
          presentation: 'modal',
          animationEnabled: true,
        }}
      />

      {/* Create group modal */}
      <Stack.Screen
        name="new/create-group"
        options={{
          presentation: 'modal',
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
