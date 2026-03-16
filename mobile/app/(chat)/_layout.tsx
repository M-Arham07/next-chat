import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/lib/store/auth.store";

export default function ChatLayout() {
  const { restoreSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[threadId]"
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen name="new" />
    </Stack>
  );
}
