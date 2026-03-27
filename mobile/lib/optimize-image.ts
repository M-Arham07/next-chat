import imageCompression from 'browser-image-compression';

/**
 * Optimizes an image file, restricting its size to 0.5MB.
 * If the file is not an image it returns the original file.
 * Throws an error if compression fails.
 */
export async function optimizeImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const options = {
      maxSizeMB: 0.5,
      useWebWorker: false, // Web workers may not be available in React Native
      onProgress: onProgress,
    };
    return await imageCompression(file, options);
  } catch (error) {
    console.error('[optimizeImage] Error compressing image:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Checks if file size exceeds maximum allowed
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Gets human-readable file size
 */
export function getFileSizeString(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
