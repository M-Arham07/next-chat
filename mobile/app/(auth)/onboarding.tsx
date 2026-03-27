import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { getSupabaseClient } from "@/supabase/client";
import { apiUrl } from "@/lib/api";
import { CreateProfileSchemaResponse } from "@chat/shared/schema/profiles/create-profile";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OnboardingScreen() {
  const [username, setUsername] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState("avatar.jpg");
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setImageUri(a.uri);
      setImageName(a.fileName ?? "avatar.jpg");
      setImageMime(a.mimeType ?? "image/jpeg");
    }
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!username.trim()) { setError("Username is required"); return; }
    if (!imageUri) { setError("Please upload a display picture"); return; }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const formData = new FormData();
      formData.append("username", username);
      formData.append("image", { uri: imageUri, name: imageName, type: imageMime } as any);

      const res = await fetch(apiUrl("/api/profiles"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      const { data, success: ok } = CreateProfileSchemaResponse.parse(json);
      if (!res.ok || !ok) throw new Error(data || "Failed to create profile");

      setSuccess("Profile created!");
      await supabase.auth.refreshSession();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="flex-grow items-center px-6 py-10 gap-y-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center gap-y-2">
            <Text className="text-3xl font-bold tracking-tight">Set up your profile</Text>
            <Text className="text-sm text-muted-foreground text-center">
              Choose a username and photo to get started
            </Text>
          </View>

          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-28 h-28 rounded-full border-2 border-border" />
            ) : (
              <View className="w-28 h-28 rounded-full bg-secondary border-2 border-border items-center justify-center gap-y-1">
                <Text className="text-4xl">📷</Text>
                <Text className="text-xs text-muted-foreground text-center px-2">Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="w-full gap-y-4">
            {error ? (
              <View className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}
            {success ? (
              <View className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <Text className="text-sm text-green-400">{success}</Text>
              </View>
            ) : null}

            <View className="gap-y-1.5">
              <Text className="text-sm font-semibold">Username</Text>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Button
              onPress={handleSave}
              disabled={!imageUri || !username.trim() || loading}
            >
              <Text>
                {loading ? "Saving…" : "Save Profile"}
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
