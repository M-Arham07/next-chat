import type { DeviceIdentity, ThreadBootstrap, WrappedThreadKey } from "@chat/shared";
import { threadBootstrapSchema } from "@chat/shared/schema";
import { ensureRegisteredDevice } from "./device-registration";
import { logE2eeStep } from "./debug";
import { getOrCreateIdentity, importPublicKey } from "./identity";
import { syncEncryptedBackupIfUnlocked } from "./passphrase-backup";
import {
    decryptMessage,
    encryptMessage,
    generateThreadKey,
    getStoredThreadKey,
    storeImportedThreadKey,
    unwrapThreadKeyFromParticipant,
    wrapThreadKeyForParticipant,
} from "./messages";

interface BootstrapResolution {
    device: DeviceIdentity;
    keyVersion: number;
    threadKey: CryptoKey;
    bootstrap: ThreadBootstrap;
}

interface ParticipantWrappedKeyPayload extends WrappedThreadKey {
    deviceId: string;
}

const bootstrapInFlight = new Map<string, Promise<BootstrapResolution>>();

const fetchBootstrap = async (
    threadId: string,
    deviceId: string,
    keyVersion?: number | null,
): Promise<ThreadBootstrap> => {
    const searchParams = new URLSearchParams({
        deviceId,
    });

    if (keyVersion) {
        searchParams.set("keyVersion", String(keyVersion));
    }

    const response = await fetch(`/api/e2ee/thread/${threadId}/bootstrap?${searchParams.toString()}`, {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch thread bootstrap");
    }

    return threadBootstrapSchema.parse(await response.json());
};

const initializeThread = async (
    threadId: string,
    deviceId: string,
    participantWrappedKeys: Array<WrappedThreadKey & { deviceId: string }>,
): Promise<number> => {
    const response = await fetch(`/api/e2ee/thread/${threadId}/initialize`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            creatorDeviceId: deviceId,
            participantWrappedKeys,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to initialize thread encryption");
    }

    const json = await response.json() as { keyVersion: number };
    return json.keyVersion;
};

const rotateThread = async (
    threadId: string,
    deviceId: string,
    participantWrappedKeys: ParticipantWrappedKeyPayload[],
): Promise<number> => {
    const response = await fetch(`/api/e2ee/thread/${threadId}/rekey`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            creatorDeviceId: deviceId,
            participantWrappedKeys,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to rotate thread encryption");
    }

    const json = await response.json() as { keyVersion: number };
    return json.keyVersion;
};

const wrapThreadKeyForActiveDevices = async (
    threadKey: CryptoKey,
    userId: string,
    participantDevices: ThreadBootstrap["participantDevices"],
): Promise<ParticipantWrappedKeyPayload[]> => {
    const identity = await getOrCreateIdentity(userId);

    return await Promise.all(
        participantDevices.map(async (participantDevice) => {
            const recipientPublicKey = await importPublicKey(participantDevice.publicKey as JsonWebKey);
            const wrapped = await wrapThreadKeyForParticipant(
                threadKey,
                identity.privateKey,
                recipientPublicKey,
                identity.publicKeyJwk,
            );

            return {
                ...wrapped,
                deviceId: participantDevice.deviceId,
            };
        }),
    );
};

export const provisionThreadEncryption = async (
    userId: string,
    threadId: string,
): Promise<BootstrapResolution> => {
    logE2eeStep("Provisioning thread encryption", {
        userId,
        threadId,
    });

    const device = await ensureRegisteredDevice(userId);
    const bootstrap = await fetchBootstrap(threadId, device.deviceId);

    let threadKey: CryptoKey;
    let keyVersion: number;

    if (bootstrap.activeKeyVersion) {
        const existingThreadKey = await getStoredThreadKey(userId, threadId, bootstrap.activeKeyVersion);

        if (!existingThreadKey) {
            throw new Error("THREAD_KEY_UNAVAILABLE_FOR_REKEY");
        }

        threadKey = existingThreadKey;
        const participantWrappedKeys = await wrapThreadKeyForActiveDevices(threadKey, userId, bootstrap.participantDevices);
        keyVersion = await rotateThread(threadId, device.deviceId, participantWrappedKeys);
    } else {
        threadKey = await generateThreadKey();
        const participantWrappedKeys = await wrapThreadKeyForActiveDevices(threadKey, userId, bootstrap.participantDevices);
        keyVersion = await initializeThread(threadId, device.deviceId, participantWrappedKeys);
    }

    await storeImportedThreadKey(userId, threadId, keyVersion, threadKey);
    await syncEncryptedBackupIfUnlocked(userId);

    const refreshedBootstrap = await fetchBootstrap(threadId, device.deviceId);

    logE2eeStep("Thread encryption provisioned", {
        threadId,
        keyVersion,
        participantDeviceCount: refreshedBootstrap.participantDevices.length,
        operation: bootstrap.activeKeyVersion ? "rekey" : "initialize",
    });

    return {
        device,
        keyVersion,
        threadKey,
        bootstrap: refreshedBootstrap,
    };
};

export const ensureThreadBootstrap = async (
    userId: string,
    threadId: string,
): Promise<BootstrapResolution> => {
    const cacheKey = `${userId}:${threadId}:active`;
    const inFlight = bootstrapInFlight.get(cacheKey);

    if (inFlight) {
        return await inFlight;
    }

    const bootstrapPromise = (async () => {
    logE2eeStep("Bootstrapping thread encryption", {
        threadId,
        userId,
    });

    const device = await ensureRegisteredDevice(userId);
    const bootstrap = await fetchBootstrap(threadId, device.deviceId);

    logE2eeStep("Fetched thread bootstrap", {
        threadId,
        deviceId: device.deviceId,
        activeKeyVersion: bootstrap.activeKeyVersion,
        participantDeviceCount: bootstrap.participantDevices.length,
        hasWrappedThreadKey: !!bootstrap.wrappedThreadKey,
    });

    if (bootstrap.activeKeyVersion && bootstrap.wrappedThreadKey) {
        const storedKey = await getStoredThreadKey(userId, threadId, bootstrap.activeKeyVersion);

        if (storedKey) {
            logE2eeStep("Using cached thread key", {
                threadId,
                keyVersion: bootstrap.activeKeyVersion,
            });

            return {
                device,
                keyVersion: bootstrap.activeKeyVersion,
                threadKey: storedKey,
                bootstrap,
            };
        }

        const identity = await getOrCreateIdentity(userId);
        const senderPublicKey = await importPublicKey(bootstrap.wrappedThreadKey.senderPublicKey as JsonWebKey);
        const importedKey = await unwrapThreadKeyFromParticipant(
            bootstrap.wrappedThreadKey as WrappedThreadKey,
            identity.privateKey,
            senderPublicKey,
        );

        await storeImportedThreadKey(userId, threadId, bootstrap.activeKeyVersion, importedKey);
        await syncEncryptedBackupIfUnlocked(userId);

        logE2eeStep("Stored imported thread key", {
            threadId,
            keyVersion: bootstrap.activeKeyVersion,
        });

        return {
            device,
            keyVersion: bootstrap.activeKeyVersion,
            threadKey: importedKey,
            bootstrap,
        };
    }

    if (bootstrap.activeKeyVersion) {
        const storedKey = await getStoredThreadKey(userId, threadId, bootstrap.activeKeyVersion);

        if (storedKey) {
            logE2eeStep("Missing wrapped key for active version, rotating from local thread key", {
                threadId,
                activeKeyVersion: bootstrap.activeKeyVersion,
            });

            return await provisionThreadEncryption(userId, threadId);
        }

        throw new Error("THREAD_KEY_NOT_AVAILABLE_ON_THIS_DEVICE");
    }

    return await provisionThreadEncryption(userId, threadId);
    })();

    bootstrapInFlight.set(cacheKey, bootstrapPromise);

    try {
        return await bootstrapPromise;
    } finally {
        bootstrapInFlight.delete(cacheKey);
    }
};

const ensureThreadKeyVersion = async (
    userId: string,
    threadId: string,
    keyVersion: number,
): Promise<CryptoKey> => {
    const storedKey = await getStoredThreadKey(userId, threadId, keyVersion);

    if (storedKey) {
        return storedKey;
    }

    const bootstrapResolution = await ensureThreadBootstrap(userId, threadId);

    if (bootstrapResolution.keyVersion === keyVersion) {
        return bootstrapResolution.threadKey;
    }

    const postBootstrapKey = await getStoredThreadKey(userId, threadId, keyVersion);

    if (postBootstrapKey) {
        return postBootstrapKey;
    }

    const cacheKey = `${userId}:${threadId}:${keyVersion}`;
    const inFlight = bootstrapInFlight.get(cacheKey);

    if (inFlight) {
        const resolved = await inFlight;
        if (resolved.keyVersion === keyVersion) {
            return resolved.threadKey;
        }
    }

    const versionBootstrapPromise = (async () => {
        logE2eeStep("Fetching wrapped key for historical thread version", {
            threadId,
            userId,
            keyVersion,
        });

        const device = await ensureRegisteredDevice(userId);
        const bootstrap = await fetchBootstrap(threadId, device.deviceId, keyVersion);

        if (!bootstrap.wrappedThreadKey) {
            throw new Error(`THREAD_KEY_VERSION_${keyVersion}_UNAVAILABLE`);
        }

        const identity = await getOrCreateIdentity(userId);
        const senderPublicKey = await importPublicKey(bootstrap.wrappedThreadKey.senderPublicKey as JsonWebKey);
        const importedKey = await unwrapThreadKeyFromParticipant(
            bootstrap.wrappedThreadKey as WrappedThreadKey,
            identity.privateKey,
            senderPublicKey,
        );

        await storeImportedThreadKey(userId, threadId, keyVersion, importedKey);
        await syncEncryptedBackupIfUnlocked(userId);

        logE2eeStep("Stored historical thread key", {
            threadId,
            keyVersion,
        });

        return {
            device,
            keyVersion,
            threadKey: importedKey,
            bootstrap,
        } satisfies BootstrapResolution;
    })();

    bootstrapInFlight.set(cacheKey, versionBootstrapPromise);

    try {
        const resolved = await versionBootstrapPromise;
        return resolved.threadKey;
    } finally {
        bootstrapInFlight.delete(cacheKey);
    }
};

export const decryptThreadMessage = async (
    userId: string,
    threadId: string,
    keyVersion: number,
    encryptedPayload: NonNullable<Awaited<ReturnType<typeof encryptMessage>>>,
): Promise<string> => {
    const resolvedThreadKey = await ensureThreadKeyVersion(userId, threadId, keyVersion);
    return await decryptMessage(encryptedPayload, resolvedThreadKey);
};
