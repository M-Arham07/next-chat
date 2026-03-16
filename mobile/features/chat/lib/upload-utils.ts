import * as FileSystem from 'expo-file-system';

export interface UploadResult {
    url: string;
    path: string;
}

/**
 * Uploads a file using a signed URL flow and reports progress.
 * In React Native, we use expo-file-system's uploadAsync instead of XMLHttpRequest.
 */
export async function GetFileUrl(
    file: { uri: string; name: string; type: string },
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    
    // Native upload doesn't have the same optimization APIs built-in 
    // without expo-image-manipulator (which we can add later if needed).
    // So we'll allocate 100% of progress to the actual upload phase.
    
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // 1. Get Signed Upload URL from our Next.js backend
    const urlRes = await fetch(`${apiUrl}/api/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            filename: file.name,
            fileType: file.type
        })
    });

    if (!urlRes.ok) {
        throw new Error("Failed to get upload URL");
    }

    const { signedUrl, path } = await urlRes.json();

    // 2. Upload Phase
    // In React Native, expo-file-system provides a resilient way to upload with progress.
    const uploadTask = FileSystem.createUploadTask(
        signedUrl,
        file.uri,
        {
            httpMethod: 'PUT',
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: {
                "Content-Type": file.type
            }
        },
        (data) => {
            if (onProgress) {
                const progress = Math.round((data.totalBytesSent / data.totalBytesExpectedToSend) * 100);
                onProgress(progress);
            }
        }
    );

    const response = await uploadTask.uploadAsync();

    if (response?.status && response.status >= 200 && response.status < 300) {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${path}`;
        return { url: publicUrl, path };
    } else {
        throw new Error(`Upload failed with status ${response?.status}`);
    }
}
