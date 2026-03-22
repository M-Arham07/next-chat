import "react-native-url-polyfill/auto";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/features/auth/context/AuthContext";
import { ChatAppProvider } from "./src/features/chat/hooks/use-chat-app";
import { ThemeProvider } from "./src/providers/ThemeProvider";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
    const [appIsReady, setAppIsReady] = React.useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Pre-load any fonts or resources here
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn("[v0] Error preparing app:", e);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    if (!appIsReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            <ChatAppProvider>
                                <NavigationContainer>
                                    <RootNavigator />
                                </NavigationContainer>
                            </ChatAppProvider>
                        </AuthProvider>
                    </QueryClientProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
