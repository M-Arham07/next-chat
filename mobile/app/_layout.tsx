import 'react-native-url-polyfill/auto';
import '@/global.css';

import { Toaster } from '@/components/ui/toast';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';
import { QueryProvider } from '@/providers/query-provider';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import GlobalLoader from '@/store/loader/GlobalLoader';
import { LoaderContextProvider, useLoader } from '@/store/loader/use-loader';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function AuthLoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-md rounded-3xl border border-border bg-card p-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="mt-3 h-4 w-56" />
        <View className="mt-8 gap-4">
          <View className="gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </View>
          <View className="gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </View>
          <Skeleton className="mt-2 h-12 w-full rounded-xl" />
        </View>
      </View>
    </View>
  );
}

function AuthGate() {
  const { profile, userId, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'register';
    const inOnboarding = segments.includes('onboarding');

    if (!userId && !inAuthGroup) {
      (router.replace as (href: string) => void)('/register');
    } else if (userId && !profile?.username && !inOnboarding) {
      (router.replace as (href: string) => void)('/register/onboarding');
    } else if (profile?.username && inAuthGroup) {
      (router.replace as (href: string) => void)('/chat/(threads)');
    }
  }, [profile, userId, loading, router, segments]);

  return null;
}

function RootNavigator() {
  const { loading } = useAuth();
  const { loading: globalLoading } = useLoader();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {globalLoading ? (
        <GlobalLoader className="absolute inset-0 items-center justify-center bg-background/80" />
      ) : null}
    </>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryProvider>
      <AuthProvider>
        <LoaderContextProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <AuthGate />
            <RootNavigator />
            <Toaster />
            <PortalHost />
          </ThemeProvider>
        </LoaderContextProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
