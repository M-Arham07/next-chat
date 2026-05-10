import { arrayBufferToBase64, base64ToUint8Array } from "./base64";
import { loadIdentityKeyPair, storeIdentityKeyPair } from "./storage";

const IDENTITY_ALGORITHM: EcKeyGenParams = {
    name: "ECDH",
    namedCurve: "P-256",
};

export const generateIdentityKeyPair = async (): Promise<CryptoKeyPair> => {
    return await crypto.subtle.generateKey(
        IDENTITY_ALGORITHM,
        false,
        ["deriveKey", "deriveBits"],
    );
};

export const exportPublicKey = async (publicKey: CryptoKey): Promise<JsonWebKey> => {
    return await crypto.subtle.exportKey("jwk", publicKey);
};

export const importPublicKey = async (publicKey: JsonWebKey): Promise<CryptoKey> => {
    return await crypto.subtle.importKey(
        "jwk",
        publicKey,
        IDENTITY_ALGORITHM,
        true,
        [],
    );
};

export const getOrCreateIdentity = async (userId: string): Promise<{
    privateKey: CryptoKey;
    publicKey: CryptoKey;
    publicKeyJwk: JsonWebKey;
}> => {
    const existing = await loadIdentityKeyPair(userId);

    if (existing) {
        return {
            privateKey: existing.privateKey,
            publicKey: await importPublicKey(existing.publicKey),
            publicKeyJwk: existing.publicKey,
        };
    }

    const keyPair = await generateIdentityKeyPair();
    const publicKeyJwk = await exportPublicKey(keyPair.publicKey);

    await storeIdentityKeyPair(userId, {
        publicKey: publicKeyJwk,
        privateKey: keyPair.privateKey,
    });

    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        publicKeyJwk,
    };
};

export const exportPublicKeyAsBase64 = async (publicKey: CryptoKey): Promise<string> => {
    const jwk = await exportPublicKey(publicKey);
    return arrayBufferToBase64(new TextEncoder().encode(JSON.stringify(jwk)).buffer);
};

export const importPublicKeyFromBase64 = async (encodedKey: string): Promise<CryptoKey> => {
    const keyJson = new TextDecoder().decode(base64ToUint8Array(encodedKey));
    return await importPublicKey(JSON.parse(keyJson) as JsonWebKey);
};
