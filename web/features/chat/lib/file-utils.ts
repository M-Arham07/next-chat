/**
 * Replaces all characters that are not letters, numbers, dot, underscore, or hyphen with an underscore.
 */
export function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

/**
 * Generates a storage-safe filename by prefixing a UUID to the sanitized original filename.
 */
export function buildStoredFilename(originalName: string): string {
    const uuid = crypto.randomUUID();
    return `${uuid}__${sanitizeFilename(originalName)}`;
}

/**
 * Recovers the original filename from a stored filename by taking everything after the first `__`.
 * Or if it's a blob url with a hash, it extracts the filename from the hash.
 * If the delimiter is not found, the full input is returned unchanged.
 */
export function getOriginalFilename(storedName: string): string {
    if (storedName.startsWith("blob:")) {
        const hashIndex = storedName.indexOf("#filename=");
        if (hashIndex !== -1) {
            return decodeURIComponent(storedName.slice(hashIndex + 10));
        }
    }

    const index = storedName.indexOf("__");
    if (index === -1) {
        return storedName;
    }
    return storedName.slice(index + 2);
}

/**
 * Reconstructs a File object from a blob URL.
 * It also extracts the original filename from the #filename= hash if present.
 */
export async function reconstructFileFromBlobUrl(blobUrl: string): Promise<File> {
    const res = await fetch(blobUrl);
    const blob = await res.blob();

    let filename = "file";
    const hashIndex = blobUrl.indexOf("#filename=");
    if (hashIndex !== -1) {
        filename = decodeURIComponent(blobUrl.slice(hashIndex + 10));
    }

    return new File([blob], filename, { type: blob.type });
}
