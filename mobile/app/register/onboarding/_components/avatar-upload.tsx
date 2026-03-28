import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, Upload } from "lucide-react-native";
import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/supabase/supabase-client";

interface AvatarUploadProps {
  displayPicture: string | null;
  setDisplayPicture: (url: string | null) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export function AvatarUpload({
  displayPicture,
  setDisplayPicture,
  setError,
  setSuccess,
}: AvatarUploadProps) {
  const colors = useThemeColors();
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        setError("Permission to access photos is required");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      setError("Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        setError("Permission to access camera is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      setError("Failed to take photo");
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    setError("");

    try {
      // Get file extension
      const ext = uri.split(".").pop() || "jpg";
      const fileName = `avatar-${Date.now()}.${ext}`;

      // Fetch the image and convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      setDisplayPicture(publicUrlData.publicUrl);
      setSuccess("Profile picture uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="items-center">
      {/* Avatar Preview */}
      <View className="mb-6">
        <View
          className="w-32 h-32 rounded-full overflow-hidden items-center justify-center"
          style={{
            backgroundColor: colors.secondary,
            borderWidth: 3,
            borderColor: colors.border,
          }}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color={colors.foreground} />
          ) : displayPicture ? (
            <Image
              source={{ uri: displayPicture }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <Camera size={40} color={colors.mutedForeground} />
          )}
        </View>
      </View>

      {/* Upload Buttons */}
      <View className="flex-row gap-4">
        <Pressable
          onPress={pickImage}
          disabled={isUploading}
          className="flex-row items-center px-6 py-3 rounded-xl"
          style={{
            backgroundColor: colors.secondary,
            opacity: isUploading ? 0.5 : 1,
          }}
        >
          <Upload size={18} color={colors.foreground} />
          <Text
            className="ml-2 text-sm font-medium"
            style={{ color: colors.foreground }}
          >
            Upload
          </Text>
        </Pressable>

        <Pressable
          onPress={takePhoto}
          disabled={isUploading}
          className="flex-row items-center px-6 py-3 rounded-xl"
          style={{
            backgroundColor: colors.foreground,
            opacity: isUploading ? 0.5 : 1,
          }}
        >
          <Camera size={18} color={colors.background} />
          <Text
            className="ml-2 text-sm font-medium"
            style={{ color: colors.background }}
          >
            Camera
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
