/**
 * Replaces all characters that are not letters, numbers, dot, underscore, or hyphen with an underscore.
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Generates a storage-safe filename by prefixing a UUID to the sanitized original filename.
 */
export function buildStoredFilename(originalName: string): string {
  const uuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return `${uuid}__${sanitizeFilename(originalName)}`;
}

/**
 * Recovers the original filename from a stored filename by taking everything after the first `__`.
 */
export function getOriginalFilename(storedName: string): string {
  const index = storedName.indexOf('__');
  if (index === -1) {
    return storedName;
  }
  return storedName.slice(index + 2);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot + 1);
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
