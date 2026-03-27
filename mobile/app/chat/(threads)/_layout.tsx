import { Stack } from 'expo-router';

/**
 * Threads group layout
 * Contains main threads list and thread detail views
 */
export default function ThreadsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {/* Main threads/inbox list */}
      <Stack.Screen name="index" />

      {/* Individual thread/message view */}
      <Stack.Screen
        name="[threadId]"
        options={{
          presentation: 'card',
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
