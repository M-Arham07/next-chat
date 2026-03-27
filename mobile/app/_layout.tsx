import '@/global.css';

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import * as SplashScreen from 'expo-splash-screen';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';
import { LoaderContextProvider } from '@/store/loader/use-loader';
import { QueryProvider } from '@/providers/query-provider';
import { ChatAppProvider } from '@/features/chat/hooks/use-chat-app';
import { useLoader } from '@/store/loader/use-loader';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Renders the main app layout with all necessary providers
 * and handles auth-based routing
 */
function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { theme } = useUniwind();

  // Determine if user is authenticated
  const isAuthenticated = !!profile;
  const inRegisterFlow = segments[0] === 'register';

  /**
   * Redirect user based on authentication state
   */
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated && !inRegisterFlow) {
        // Not authenticated and not in register flow - redirect to register
        router.replace('/register');
      } else if (isAuthenticated && inRegisterFlow) {
        // Authenticated and in register flow - redirect to chat
        router.replace('/chat');
      }
    }
  }, [isAuthenticated, authLoading, inRegisterFlow, router]);

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {/* Auth/Register Routes */}
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* Chat Routes */}
        <Stack.Screen name="chat" options={{ headerShown: false }} />

        {/* Catch-all for undefined routes */}
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Oops!',
            headerShown: true,
          }}
        />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}

/**
 * Root Layout Component
 * Wraps entire app with providers in correct order
 */
export default function RootLayout() {
  /**
   * Already loaded via global.css with NativeWind
   * No additional font loading needed
   */
  
  useEffect(() => {
    // Hide splash screen on mount
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <LoaderContextProvider>
            <AuthProvider>
              <ChatAppProvider>
                <RootLayoutNav />
              </ChatAppProvider>
            </AuthProvider>
          </LoaderContextProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
