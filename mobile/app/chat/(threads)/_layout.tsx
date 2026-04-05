import { Stack } from "expo-router";

export default function ThreadsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="[threadId]/index"
                options={{ animation: "slide_from_right" }}
            />
        </Stack>
    )
};
