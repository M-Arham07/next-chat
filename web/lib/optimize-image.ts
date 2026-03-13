import imageCompression from "browser-image-compression";

/**
 * Optimizes an image file if it is an image, restricting its size to 3MB.
 * If the file is not an image or compression fails, it returns the original file.
 */
export async function optimizeImage(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) {
        return file;
    }

    try {
        const options = {
            maxSizeMB: 0.5,
            useWebWorker: true,
        };
        return await imageCompression(file, options);
    } catch (error) {
        console.error("[optimizeImage] Error compressing image:", error);
        return file; // Fallback to the original file if compression fails
    }
}
