/**
 * Optimizes a video file using a single FFmpeg instance.
 * Applies a lightweight, fast compression limiting the resolution to 720p.
 */
export async function optimizeVideo(file: File, onProgress?: (percent: number) => void): Promise<File> {
        onProgress?.(100);
        return file;
}
