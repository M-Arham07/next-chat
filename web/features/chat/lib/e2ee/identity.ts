import { arrayBufferToBase64, base64ToUint8Array } from "./base64";
import { measureAsync } from "./debug";
import { loadIdentityKeyPair, storeIdentityKeyPair } from "./storage";

const IDENTITY_ALGORITHM: EcKeyGenParams = {
    name: "ECDH",
    namedCurve: "P-256",
};

const identityRuntimeCache = new Map<string, {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
    publicKeyJwk: JsonWebKey;
}>();

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
    return await measureAsync("crypto.identity.import-public-key", async () => await crypto.subtle.importKey(
        "jwk",
        publicKey,
        IDENTITY_ALGORITHM,
        true,
        [],
    ));
};

export const getOrCreateIdentity = async (userId: string): Promise<{
    privateKey: CryptoKey;
    publicKey: CryptoKey;
    publicKeyJwk: JsonWebKey;
}> => {
    const cached = identityRuntimeCache.get(userId);
    if (cached) {
        return cached;
    }

    const existing = await loadIdentityKeyPair(userId);

    if (existing) {
        const hydrated = {
            privateKey: existing.privateKey,
            publicKey: await importPublicKey(existing.publicKey),
            publicKeyJwk: existing.publicKey,
        };

        identityRuntimeCache.set(userId, hydrated);
        return hydrated;
    }

    const keyPair = await measureAsync("crypto.identity.generate-keypair", async () => await generateIdentityKeyPair());
    const publicKeyJwk = await measureAsync("crypto.identity.export-public-key", async () => await exportPublicKey(keyPair.publicKey));

    await storeIdentityKeyPair(userId, {
        publicKey: publicKeyJwk,
        privateKey: keyPair.privateKey,
    });

    const created = {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        publicKeyJwk,
    };

    identityRuntimeCache.set(userId, created);
    return created;
};

export const exportPublicKeyAsBase64 = async (publicKey: CryptoKey): Promise<string> => {
    const jwk = await exportPublicKey(publicKey);
    return arrayBufferToBase64(new TextEncoder().encode(JSON.stringify(jwk)).buffer);
};

export const importPublicKeyFromBase64 = async (encodedKey: string): Promise<CryptoKey> => {
    const keyJson = new TextDecoder().decode(base64ToUint8Array(encodedKey));
    return await importPublicKey(JSON.parse(keyJson) as JsonWebKey);
};
