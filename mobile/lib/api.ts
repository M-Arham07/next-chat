/**
 * Base URL for all API calls to the Next.js backend.
 * Set EXPO_PUBLIC_API_BASE_URL in your .env file.
 * e.g. EXPO_PUBLIC_API_BASE_URL=https://your-app.vercel.app
 * or for local dev:  EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
