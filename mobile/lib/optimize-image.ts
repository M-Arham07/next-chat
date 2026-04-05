import * as ImageManipulator from "expo-image-manipulator";

/**
 * Optimizes an image file if it is an image, restricting its size to 3MB.
 * If the file is not an image it returns the original file.
 * Throws an error if compression fails.
 */
export async function optimizeImage(file: File, onProgress?: (percent: number) => void): Promise<File> {
    if (!file.type.startsWith("image/")) {
        return file;
    }

    try {
        onProgress?.(10);
        const result = await ImageManipulator.manipulateAsync(
            (file as unknown as { uri: string }).uri,
            [{ resize: { width: 800 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        onProgress?.(100);
        return ({
            ...(file as unknown as Record<string, unknown>),
            uri: result.uri,
            name: file.name.replace(/\.[^.]+$/, ".jpg"),
            type: "image/jpeg",
        } as unknown) as File;
    } catch (error) {
        console.error("[optimizeImage] Error compressing image:", error);
        throw error;
    }
}
