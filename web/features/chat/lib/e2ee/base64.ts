const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const utf8ToUint8Array = (value: string): Uint8Array => {
    return textEncoder.encode(value);
};

export const uint8ArrayToUtf8 = (value: Uint8Array): string => {
    return textDecoder.decode(value);
};

export const toArrayBuffer = (value: ArrayBuffer | ArrayBufferLike | Uint8Array): ArrayBuffer => {
    if (value instanceof Uint8Array) {
        return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
    }

    if (value instanceof ArrayBuffer) {
        return value;
    }

    return new Uint8Array(value).slice().buffer;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer | ArrayBufferLike | Uint8Array): string => {
    let binary = "";
    const bytes = new Uint8Array(toArrayBuffer(buffer));

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
};

export const base64ToUint8Array = (value: string): Uint8Array => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
};
