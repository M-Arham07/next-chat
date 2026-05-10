const E2EE_LOG_PREFIX = "[e2ee]";

const preview = (value: string, maxLength = 48) => {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength)}…`;
};

export const logE2eeStep = (label: string, details?: Record<string, unknown>) => {
    if (details) {
        console.log(`${E2EE_LOG_PREFIX} ${label}`, details);
        return;
    }

    console.log(`${E2EE_LOG_PREFIX} ${label}`);
};

export const previewCiphertext = (ciphertext: string) => preview(ciphertext);

export const previewIv = (iv: string) => preview(iv, 24);
