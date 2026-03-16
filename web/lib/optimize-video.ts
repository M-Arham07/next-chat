import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

/**
 * Optimizes a video file using FFmpeg WASM.
 * Targets a file size around 4.9MB.
 */
export async function optimizeVideo(file: File, onProgress?: (percent: number) => void): Promise<File> {
    if (!file.type.startsWith("video/")) {
        return file;
    }

    // If already under 4.9MB, skip optimization
    if (file.size <= 4.9 * 1024 * 1024) {
        if (onProgress) onProgress(100);
        return file;
    }

    try {
        if (!ffmpeg) {
            ffmpeg = new FFmpeg();
        }

        if (!ffmpeg.loaded) {
            const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            });
        }

        ffmpeg.on('progress', ({ progress }) => {
            if (onProgress) onProgress(Math.round(progress * 100));
        });

        const inputName = "input_" + file.name;
        const outputName = "output_optimized.mp4";

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // We use libx264 with a higher CRF to reduce size. 
        // CRF 32 is quite aggressive but helps hit the size limit for larger videos.
        // We also use -preset fast for a balance of speed and compression.
        
        await ffmpeg.exec([
            "-i", inputName,
            "-vf", "scale='min(854,iw)':-2",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "35",
            "-tune", "fastdecode",
            "-c:a", "aac",
            "-b:a", "128k",
            "-map_metadata", "-1",
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        const optimizedBlob = new Blob([data as any], { type: "video/mp4" });

        // If it's still too large, we might need another pass or alert the user,
        // but for now we return the result.
        const optimizedFile = new File([optimizedBlob], file.name.replace(/\.[^/.]+$/, "") + "_optimized.mp4", {
            type: "video/mp4",
        });

        // Cleanup virtual fs
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        console.log(`[optimizeVideo] Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, Optimized: ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`);

        return optimizedFile;
    } catch (error) {
        console.error("[optimizeVideo] Compression failed:", error);
        return file; // Fallback to original
    }
}
