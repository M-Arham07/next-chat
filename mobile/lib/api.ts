import { createClient } from '@/supabase/client';

function normalizeEnvValue(value: string | undefined) {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, '');
}

export function getBaseApiUrl() {
  const baseApiUrl = normalizeEnvValue(process.env.EXPO_PUBLIC_BASE_API_URL);

  if (!baseApiUrl) {
    throw new Error('EXPO_PUBLIC_BASE_API_URL is not configured');
  }

  return baseApiUrl.replace(/\/+$/, '');
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseApiUrl()}${normalizedPath}`;
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const supabase = createClient();
  const accessToken = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;

  const headers = new Headers(init.headers ?? {});

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(buildApiUrl(input), {
    ...init,
    headers,
  });
}
