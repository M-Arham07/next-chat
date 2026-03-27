/**
 * Media type detection utilities
 * Determines the type of media based on file extension or MIME type
 */

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export function detectMediaType(fileName?: string, mimeType?: string): MediaType {
  const name = fileName?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';

  // Check MIME type first
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  // Check file extension
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.flv'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

  if (imageExts.some((ext) => name.endsWith(ext))) return 'image';
  if (videoExts.some((ext) => name.endsWith(ext))) return 'video';
  if (audioExts.some((ext) => name.endsWith(ext))) return 'audio';

  return 'document';
}

export function getMediaFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'file';
}

export function getMediaTypeIcon(
  mediaType: MediaType
): 'image' | 'video' | 'audio' | 'document' {
  if (mediaType === 'image') return 'image';
  if (mediaType === 'video') return 'video';
  if (mediaType === 'audio') return 'audio';
  return 'document';
}
