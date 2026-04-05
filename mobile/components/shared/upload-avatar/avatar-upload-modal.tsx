import { useState } from "react";
import { View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  avatarSize: number;
}

export default function AvatarUploadModal({
  isOpen,
  onClose,
  onConfirm,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    setPreview(asset.uri);
    setSelectedFile(({
      uri: asset.uri,
      name: asset.fileName ?? `avatar_${Date.now()}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize,
    } as unknown) as File);
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    onConfirm(selectedFile);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <Text className="text-lg font-semibold">Select Profile Picture</Text>
        </DialogHeader>

        {!preview ? (
          <Button variant="outline" className="mt-4 h-28 rounded-lg" onPress={() => void handlePickImage()}>
            <Text>Select an image</Text>
          </Button>
        ) : (
          <View className="mt-4 items-center gap-4">
            <Image source={{ uri: preview }} style={{ width: 128, height: 128, borderRadius: 64 }} contentFit="cover" />
            <View className="w-full flex-row gap-2">
              <Button variant="outline" className="flex-1" onPress={handleClose}>
                <Text>Cancel</Text>
              </Button>
              <Button className="flex-1" onPress={handleConfirm}>
                <Text>Confirm</Text>
              </Button>
            </View>
          </View>
        )}

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
