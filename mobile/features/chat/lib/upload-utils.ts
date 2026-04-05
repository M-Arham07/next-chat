
import { optimizeImage } from "@/lib/optimize-image";
import { optimizeVideo } from "@/lib/optimize-video";
import { createClient } from "@/supabase/client";
import { buildStoredFilename } from "./file-utils";

export interface UploadResult {
    url: string;
    path: string;
}

// FOR NOW COMRPESSION DISABLED FOR VIDEOS! 

/**
 * Uploads a file directly to the Supabase 'media' bucket.
 * Optimization: 0% - 50%
 * Upload: jumps to 100% when complete.
 */
export async function GetFileUrl(
    file: File,
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    console.log("GetFileUrl called with file",file)
    const supabase = createClient();
    if (!supabase) {
        throw new Error("Supabase is not configured");
    }

    // 1. Optimization Phase (0% - 50%)
    let fileToUpload = file;

    console.log("Received file is",file)
    const reportOptimizationProgress = (percent: number) => {
        if (onProgress) {
            // Optimization accounts for the first 50%
            onProgress(Math.round(percent / 2));
        }
    };

    if (file.type.startsWith("image/")) {
        fileToUpload = await optimizeImage(file, reportOptimizationProgress);
    } else if (file.type.startsWith("video/")) {
        fileToUpload = await optimizeVideo(file, reportOptimizationProgress);

    } else {
        // No optimization for other types
        if (onProgress) onProgress(50);
    }

    // 2. Direct Upload Phase (50% - 100%)
    const storedFilename = buildStoredFilename(fileToUpload.name);

    // Get current session token to authenticate the direct XHR upload
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/media/${encodeURIComponent(storedFilename)}`;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && onProgress) {
                const uploadPercent = (event.loaded / event.total) * 100;
                // Upload accounts for the second 50% (from 50 to 100)
                const combinedPercent = 50 + Math.round(uploadPercent / 2);
                onProgress(combinedPercent);
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${encodeURIComponent(storedFilename)}`;
                if (onProgress) onProgress(100);
                resolve({ url: publicUrl, path: storedFilename });
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("POST", uploadUrl);
        // Authenticate the direct upload
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("Content-Type", fileToUpload.type);
        // Include x-upsert header to match standard SDK behavior
        xhr.setRequestHeader("x-upsert", "false");

        xhr.send(fileToUpload);
    });
}
