import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Asset } from "expo-media-library";

export type MediaType = "image" | "document" | "voice";

export interface MediaFile {
  uri: string;
  type: MediaType;
  name?: string;
  size?: number;
  mimeType?: string;
}

/**
 * Pick an image from device gallery or camera
 */
export async function pickImage(
  allowsMultiple: boolean = false
): Promise<MediaFile | MediaFile[] | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultiple,
    });

    if (result.canceled) {
      return null;
    }

    if (allowsMultiple && "assets" in result) {
      return result.assets.map((asset) => ({
        uri: asset.uri,
        type: "image" as const,
        name: asset.filename || "image",
        mimeType: "image/jpeg",
      }));
    }

    if (!("assets" in result) || !result.assets[0]) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
      type: "image" as const,
      name: result.assets[0].filename || "image",
      mimeType: "image/jpeg",
    };
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
}

/**
 * Pick a document from device
 */
export async function pickDocument(): Promise<MediaFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    if (!result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: "document" as const,
      name: asset.name,
      size: asset.size,
      mimeType: asset.mimeType,
    };
  } catch (error) {
    console.error("Error picking document:", error);
    return null;
  }
}

/**
 * Take a photo from camera
 */
export async function takePhoto(): Promise<MediaFile | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    if (!("assets" in result) || !result.assets[0]) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
      type: "image" as const,
      name: "camera-photo",
      mimeType: "image/jpeg",
    };
  } catch (error) {
    console.error("Error taking photo:", error);
    return null;
  }
}

/**
 * Upload media file (mock - replace with actual implementation)
 */
export async function uploadMedia(file: MediaFile): Promise<string> {
  try {
    // Mock upload - in real app, send to backend
    console.log("Uploading media:", file);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock URL
    return `https://example.com/media/${Date.now()}`;
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
}
