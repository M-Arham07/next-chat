import * as FileSystem from "expo-file-system";
import { getSupabaseClient } from "@/supabase/client";
import { buildStoredFilename } from "./file-utils";

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Uploads a file to the Supabase 'media' bucket using expo-file-system.
 * Reports progress from 0-100%.
 */
export async function GetFileUrl(
  fileUri: string,
  mimeType: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = getSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");

  if (onProgress) onProgress(10);

  const storedFilename = buildStoredFilename(fileName);
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/media/${encodeURIComponent(storedFilename)}`;

  const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Upload failed with status ${uploadResult.status}`);
  }

  if (onProgress) onProgress(100);

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${encodeURIComponent(storedFilename)}`;
  return { url: publicUrl, path: storedFilename };
}
