import { optimizeImage } from '@/lib/optimize-image';
import { supabase } from '@/supabase/supabase-client';
import { buildStoredFilename } from '@/lib/file-utils';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Uploads a file directly to the Supabase 'media' bucket.
 * Optimization: 0% - 50%
 * Upload: jumps to 100% when complete.
 */
export async function getFileUrl(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  console.log('[getFileUrl] called with file', file);

  // 1. Optimization Phase (0% - 50%)
  let fileToUpload = file;

  const reportOptimizationProgress = (percent: number) => {
    if (onProgress) {
      // Optimization accounts for the first 50%
      onProgress(Math.round(percent / 2));
    }
  };

  if (file.type.startsWith('image/')) {
    fileToUpload = await optimizeImage(file, reportOptimizationProgress);
  } else {
    // No optimization for videos/audio/documents in React Native
    if (onProgress) onProgress(50);
  }

  // 2. Upload Phase (50% - 100%)
  const storedFilename = buildStoredFilename(fileToUpload.name);

  try {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(storedFilename, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileToUpload.type,
      });

    if (error) throw new Error(error.message);

    if (onProgress) onProgress(100);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(storedFilename);

    return {
      url: publicUrlData.publicUrl,
      path: storedFilename,
    };
  } catch (error) {
    console.error('[getFileUrl] Upload failed:', error);
    throw error;
  }
}

/**
 * Upload avatar and get the public URL
 */
export async function uploadAvatarAndGetLink(avatar: File): Promise<string> {
  const MAX_AVATAR_MB = 0.5;

  if (avatar.size > MAX_AVATAR_MB * 1024 * 1024) {
    throw new Error('Avatar size must be less than 500KB');
  }

  const fileExt = avatar.name.split('.').pop() || 'jpg';
  const fileName = `avatars/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, avatar, {
      cacheControl: '3600',
      upsert: true,
      contentType: avatar.type,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
