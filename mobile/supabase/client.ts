import 'react-native-url-polyfill/auto';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

let warnedAboutMissingConfig = false;

function normalizeEnvValue(value: string | undefined) {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, '');
}

const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
    if (!chunkCountStr) {
      return SecureStore.getItemAsync(key);
    }
    const chunkCount = parseInt(chunkCountStr, 10);
    const chunks: string[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
      if (chunk == null) return null;
      chunks.push(chunk);
    }
    return chunks.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const chunkSize = 1800;
    if (value.length <= chunkSize) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += chunkSize) {
      chunks.push(value.slice(i, i + chunkSize));
    }
    await SecureStore.setItemAsync(`${key}_chunk_count`, String(chunks.length));
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
    }
  },
  async removeItem(key: string): Promise<void> {
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
    if (chunkCountStr) {
      const count = parseInt(chunkCountStr, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_chunk_count`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

let _supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  const supabaseUrl = normalizeEnvValue(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey =
    normalizeEnvValue(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) ??
    normalizeEnvValue(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warnedAboutMissingConfig) {
      console.warn(
        'Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable auth.'
      );
      warnedAboutMissingConfig = true;
    }
    return null;
  }

  if (_supabaseInstance) {
    return _supabaseInstance;
  }

  _supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: LargeSecureStore,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _supabaseInstance;
}
