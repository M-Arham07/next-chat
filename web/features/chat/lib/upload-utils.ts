import { optimizeImage } from "@/lib/optimize-image";
import { optimizeVideo } from "@/lib/optimize-video";

export interface UploadResult {
    url: string;
    path: string;
}


// FOR NOW COMRPESSION DISABLED FOR VIDEOS! 

/**
 * Uploads a file using a signed URL flow and reports combined progress.
 * Optimization: 0% - 50%
 * Upload: 50% - 100%
 */
export async function GetFileUrl(
    file: File,
    onProgress?: (progress: number) => void
): Promise<UploadResult> {

    // 1. Optimization Phase (0% - 50%)
    let fileToUpload = file;

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
        // for now compression is disabled for videos
        fileToUpload = file;
    } else {
        // No optimization for other types
        if (onProgress) onProgress(50);
    }

    // 2. Get Signed Upload URL
    const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            filename: fileToUpload.name,
            fileType: fileToUpload.type
        })
    });

    if (!urlRes.ok) {
        const err = await urlRes.json();
        throw new Error(err.error || "Failed to get upload URL");
    }

    const { signedUrl, path } = await urlRes.json();

    // 3. Upload Phase (50% - 100%)
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
                // Return the public URL. Supabase public URL format:
                // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${path}`;

                resolve({ url: publicUrl, path });
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("PUT", signedUrl);
        // Supabase expects the file type to be set in the headers if we want to preserve it
        xhr.setRequestHeader("Content-Type", fileToUpload.type);
        // If the signed URL doesn't already contain the token in a way that handles auth, 
        // we might need x-upsert if allowed, but here we just PUT.
        xhr.send(fileToUpload);
    });
}
