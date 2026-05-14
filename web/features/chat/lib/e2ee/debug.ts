const E2EE_LOG_PREFIX = "[e2ee]";
const PERF_LOG_PREFIX = "[e2ee:perf]";
const SLOW_OPERATION_MS = 16;

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

type PerfEntry = {
    label: string;
    durationMs: number;
    at: string;
    details?: Record<string, unknown>;
};

type PerfBucket = {
    count: number;
    totalMs: number;
    maxMs: number;
    lastMs: number;
};

const getPerfStore = (): {
    entries: PerfEntry[];
    buckets: Map<string, PerfBucket>;
} | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const scope = window as typeof window & {
        __e2eePerf__?: {
            entries: PerfEntry[];
            buckets: Map<string, PerfBucket>;
        };
        __printE2eePerfSummary__?: () => void;
    };

    scope.__e2eePerf__ ??= {
        entries: [],
        buckets: new Map(),
    };
    scope.__printE2eePerfSummary__ ??= printPerfSummary;

    return scope.__e2eePerf__;
};

export const recordPerf = (
    label: string,
    durationMs: number,
    details?: Record<string, unknown>,
): void => {
    const store = getPerfStore();
    const roundedDuration = Number(durationMs.toFixed(2));

    if (store) {
        store.entries.push({
            label,
            durationMs: roundedDuration,
            at: new Date().toISOString(),
            details,
        });

        const bucket = store.buckets.get(label) ?? {
            count: 0,
            totalMs: 0,
            maxMs: 0,
            lastMs: 0,
        };

        bucket.count += 1;
        bucket.totalMs += roundedDuration;
        bucket.maxMs = Math.max(bucket.maxMs, roundedDuration);
        bucket.lastMs = roundedDuration;
        store.buckets.set(label, bucket);
    }

    if (roundedDuration >= SLOW_OPERATION_MS) {
        console.log(`${PERF_LOG_PREFIX} ${label}`, {
            durationMs: roundedDuration,
            ...details,
        });
    }
};

export const measureAsync = async <T>(
    label: string,
    operation: () => Promise<T>,
    details?: Record<string, unknown>,
): Promise<T> => {
    const start = performance.now();

    try {
        return await operation();
    } finally {
        recordPerf(label, performance.now() - start, details);
    }
};

export const measureSync = <T>(
    label: string,
    operation: () => T,
    details?: Record<string, unknown>,
): T => {
    const start = performance.now();

    try {
        return operation();
    } finally {
        recordPerf(label, performance.now() - start, details);
    }
};

export const printPerfSummary = (): void => {
    const store = getPerfStore();

    if (!store) {
        return;
    }

    console.table(
        [...store.buckets.entries()].map(([label, bucket]) => ({
            label,
            count: bucket.count,
            avgMs: Number((bucket.totalMs / bucket.count).toFixed(2)),
            maxMs: bucket.maxMs,
            lastMs: bucket.lastMs,
        })),
    );
};
