import * as ImageManipulator from "expo-image-manipulator";

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Optimizes an image by resizing and compressing it
 * @param uri - The local URI of the image to optimize
 * @param options - Optimization options
 * @returns The optimized image URI
 */
export async function optimizeImage(
  uri: string,
  options: OptimizeOptions = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  const actions: ImageManipulator.Action[] = [];

  // Get image info to calculate resize dimensions
  // For now, we'll just resize to max dimensions
  actions.push({
    resize: {
      width: maxWidth,
      height: maxHeight,
    },
  });

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
}

/**
 * Creates a thumbnail from an image
 * @param uri - The local URI of the image
 * @param size - The target size (both width and height)
 * @returns The thumbnail URI
 */
export async function createThumbnail(
  uri: string,
  size: number = 100
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        resize: {
          width: size,
          height: size,
        },
      },
    ],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
}
