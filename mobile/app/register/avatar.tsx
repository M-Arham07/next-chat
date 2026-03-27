import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { uploadAvatarAndGetLink } from '@/features/chat/lib/upload-utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

/**
 * Avatar Upload Screen
 * Third step in registration after username
 */
export default function AvatarScreen() {
  const router = useRouter();
  const { colors } = useUniwind();
  const { profile } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Skip mutation - if user wants to skip
  const skipMutation = useMutation({
    mutationFn: async () => {
      // Just navigate to onboarding or chat
      return { skipped: true };
    },
    onSuccess: () => {
      router.push('/register/onboarding');
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!response.granted) {
        throw new Error('Camera roll permission required');
      }

      // Get file from URI
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // Convert to File-like object for upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileType}`,
        name: `avatar.${fileType}`,
      } as any);

      // Upload and link
      const { url } = await uploadAvatarAndGetLink(
        { uri: imageUri, type: `image/${fileType}`, name: `avatar.${fileType}` } as any,
        (progress) => setUploadProgress(progress)
      );

      // Update profile with avatar URL
      await apiClient.put('/profiles', {
        avatar_url: url,
      });

      return { url };
    },
    onSuccess: () => {
      router.push('/register/onboarding');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
      console.error('Upload error:', error);
    },
  });

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled && result.assets?.[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Error', 'Camera permission required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled && result.assets?.[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    await uploadMutation.mutateAsync(selectedImage);
  };

  // If already has avatar, skip
  if (profile?.avatar_url) {
    router.replace('/register/onboarding');
    return null;
  }

  const isUploading = uploadMutation.isPending;
  const hasImage = !!selectedImage;

  return (
    <View className="flex-1 bg-background px-4 py-8 justify-between">
      {/* Header */}
      <View>
        <Text className="text-3xl font-bold text-foreground mb-2">Profile Picture</Text>
        <Text className="text-muted-foreground">
          Choose a photo that represents you
        </Text>
      </View>

      {/* Avatar Preview / Picker */}
      <View className="flex-1 items-center justify-center">
        {selectedImage ? (
          <View className="items-center">
            <Image
              source={{ uri: selectedImage }}
              className="w-32 h-32 rounded-full mb-4"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <View className="w-32 h-32 absolute items-center justify-center">
                <Text className="text-white font-bold">
                  {Math.round(uploadProgress)}%
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            className="w-32 h-32 rounded-full items-center justify-center border-2 border-dashed"
            style={{ borderColor: colors['border'] }}
          >
            <Text className="text-4xl">📷</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="gap-2">
        {!hasImage ? (
          <>
            <TouchableOpacity
              onPress={handlePickImage}
              className="py-3 rounded-lg border border-border"
            >
              <Text className="text-foreground font-semibold text-center">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTakePhoto}
              className="py-3 rounded-lg border border-border"
            >
              <Text className="text-foreground font-semibold text-center">
                Take a Photo
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="py-3 rounded-lg border border-border"
            disabled={isUploading}
          >
            <Text className="text-foreground font-semibold text-center">
              Choose Different Photo
            </Text>
          </TouchableOpacity>
        )}

        {hasImage && (
          <TouchableOpacity
            onPress={handleUpload}
            disabled={isUploading}
            className={`py-3 rounded-lg ${
              isUploading ? 'bg-muted' : 'bg-primary'
            }`}
          >
            {isUploading ? (
              <ActivityIndicator color={colors['primary-foreground']} />
            ) : (
              <Text className="text-primary-foreground font-semibold text-center">
                Upload & Continue
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => skipMutation.mutate()}
          className="py-3 rounded-lg"
        >
          <Text className="text-muted-foreground font-semibold text-center">
            Skip for Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
