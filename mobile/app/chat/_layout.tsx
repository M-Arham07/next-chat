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
      {/* Threads group (handles its own layout) */}
      <Stack.Screen
        name="(threads)"
        options={{
          headerShown: false,
        }}
      />

      {/* New thread/search users */}
      <Stack.Screen
        name="new/index"
        options={{
          presentation: 'modal',
          animationEnabled: true,
          headerShown: false,
        }}
      />

      {/* Create group modal */}
      <Stack.Screen
        name="new/create-group"
        options={{
          presentation: 'modal',
          animationEnabled: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
