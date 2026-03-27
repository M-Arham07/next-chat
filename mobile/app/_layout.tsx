import "../global.css";
import "react-native-gesture-handler";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/features/auth/hooks/useAuth";
import { LoaderContextProvider } from "@/store/loader/use-loader";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
});

// ── Auth guard — redirects based on auth state ─────────────────────
function AuthGuard() {
  const { profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!profile?.id) {
      // Not logged in → send to login
      if (!inAuthGroup) router.replace("/(auth)/login");
    } else if (!profile?.username) {
      // Logged in but no profile → onboarding
      router.replace("/(auth)/onboarding");
    } else {
      // Fully authenticated → main app
      if (inAuthGroup) router.replace("/(tabs)");
    }
  }, [profile, loading]);

  return null;
}

// ── Root layout ────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LoaderContextProvider>
            <AuthProvider>
              <AuthGuard />
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="chat/[threadId]" />
                <Stack.Screen name="chat/new" />
              </Stack>
            </AuthProvider>
          </LoaderContextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
