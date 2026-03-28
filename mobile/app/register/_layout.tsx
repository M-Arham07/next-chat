import { Stack } from 'expo-router';
import * as React from 'react';

/**
 * Register flow layout
 * Handles all auth-related screens (login, username, avatar, onboarding)
 */
export default function RegisterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: false, // Disable back gesture to prevent accidentally leaving auth flow
      }}
    >
      {/* Initial auth/login screen */}
      <Stack.Screen name="index" />

      {/* Username setup */}
      <Stack.Screen name="username" />

      {/* Avatar upload */}
      <Stack.Screen name="avatar" />

      {/* Onboarding (nested route) */}
      <Stack.Screen name="onboarding/index" />
    </Stack>
  );
}
