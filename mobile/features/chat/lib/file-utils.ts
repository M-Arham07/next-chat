import * as FileSystem from 'expo-file-system';

export function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export function buildStoredFilename(originalName: string): string {
    const uuid = Math.random().toString(36).substring(2, 15);
    return `${uuid}__${sanitizeFilename(originalName)}`;
}

export function getOriginalFilename(storedName: string): string {
    if (storedName.startsWith("file://")) {
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
 * On native, we can't easily reconstruct a File object like on Web.
 * Instead, we use the local URI or pass it as an object { uri, name, type }
 * which matches the required shape for FormData in React Native.
 */
export async function reconstructFileFromBlobUrl(fileUri: string): Promise<any> {
    console.log("[reconstructFileFromBlobUrl] uri is", fileUri);
    
    const fetchUrl = fileUri.split("#")[0];
    
    // In React Native, if we need to upload this, we usually just need its uri, 
    // name, and mime type for FormData. 
    
    let filename = "file";
    const hashIndex = fileUri.indexOf("#filename=");
    if (hashIndex !== -1) {
        filename = decodeURIComponent(fileUri.slice(hashIndex + 10));
    } else {
        filename = fetchUrl.split('/').pop() || 'file';
    }

    // Attempt to guess type from extension, or let the upload-utils handle it.
    let ext = filename.split('.').pop()?.toLowerCase();
    let type = "application/octet-stream";
    if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
    else if (ext === 'png') type = 'image/png';
    else if (ext === 'm4a') type = 'audio/m4a';
    else if (ext === 'mp4') type = 'video/mp4';

    return {
        uri: fetchUrl,
        name: filename,
        type: type,
    };
}
