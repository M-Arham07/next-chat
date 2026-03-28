import { useState } from "react";
import { View, Pressable, Modal, Dimensions } from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ImageMessageProps {
  imageUrl: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function ImageMessage({ imageUrl }: ImageMessageProps) {
  const colors = useThemeColors();
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setIsViewerOpen(true)}>
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 12,
          }}
          contentFit="cover"
        />
      </Pressable>

      {/* Full Screen Image Viewer */}
      <Modal
        visible={isViewerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsViewerOpen(false)}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        >
          <Pressable
            onPress={() => setIsViewerOpen(false)}
            className="absolute top-12 right-4 z-10 p-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <X size={24} color="white" />
          </Pressable>

          <Image
            source={{ uri: imageUrl }}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT * 0.7,
            }}
            contentFit="contain"
          />
        </View>
      </Modal>
    </>
  );
}
