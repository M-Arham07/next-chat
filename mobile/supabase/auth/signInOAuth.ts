import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { createClient } from '../client';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient();
  if (!supabase) {
    console.error('Supabase is not configured');
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    const redirectTo = Linking.createURL('/auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      console.error('OAuth error:', error);
      return null;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      if (code) await supabase.auth.exchangeCodeForSession(code);
    }
    return data;
  }

  return null;
}
