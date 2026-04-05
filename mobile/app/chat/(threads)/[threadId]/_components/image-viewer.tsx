"use client";

import { Image } from "expo-image";
import { View, Pressable, Modal, StyleSheet, Dimensions } from "react-native";
import { MotiView } from "moti";
import { X } from "lucide-react-native";

interface ImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

const ImageViewer = ({ imageUrl, isOpen, onClose }: ImageViewerProps) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <MotiView
          style={styles.content}
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Image source={{ uri: imageUrl || undefined }} style={styles.image} contentFit="contain" />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={24} color="white" />
          </Pressable>
        </MotiView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0f0f0f",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 999,
  },
});

export default ImageViewer;
