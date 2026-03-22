export const colors = {
    // Primary brand colors
    primary: "#3B82F6",
    primaryLight: "#DBEAFE",
    primaryDark: "#1E40AF",

    // Neutrals
    background: "#FFFFFF",
    surface: "#F9FAFB",
    foreground: "#1F2937",
    muted: "#6B7280",
    mutedForeground: "#9CA3AF",
    border: "#E5E7EB",

    // Status colors
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",

    // Additional
    destructive: "#DC2626",
    ring: "#3B82F6",

    // Dark mode variants
    dark: {
        background: "#0F172A",
        surface: "#1E293B",
        foreground: "#F1F5F9",
        muted: "#64748B",
        mutedForeground: "#94A3B8",
        border: "#334155",
    },
};

export type ColorKey = keyof typeof colors;
