import imageCompression from "browser-image-compression";

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
        const options = {
            maxSizeMB: 0.5,
            useWebWorker: true,
            onProgress: onProgress,
        };
        return await imageCompression(file, options);
    } catch (error) {
        console.error("[optimizeImage] Error compressing image:", error);
        throw error;
    }
}
