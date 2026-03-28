import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/supabase/supabase-client';

// Complete OAuth session on app launch
WebBrowser.maybeCompleteAuthSession();

/**
 * Create a valid redirect URL for OAuth callbacks
 * Uses the app's deep link scheme: nextchat://
 */
const redirectToURL = Linking.createURL('');

/**
 * Sign in with OAuth provider using Supabase OAuth flow
 * Supports: Google, GitHub, Discord, Apple
 *
 * Flow:
 * 1. Get OAuth URL from Supabase
 * 2. Open URL in WebBrowser (managed by expo-web-browser)
 * 3. User authenticates and browser returns
 * 4. Session is automatically restored from SecureStore
 * 5. useAuth hook detects profile change → app redirects to /chat
 *
 * @param provider - OAuth provider ('google' | 'github' | 'discord' | 'apple')
 * @returns Promise resolving to void when OAuth flow completes
 * @throws Error if OAuth flow fails or is cancelled
 */
export async function signInWithOAuth(
  provider: 'google' | 'github' | 'discord' | 'apple'
): Promise<void> {
  try {
    // Validate provider
    const validProviders = ['google', 'github', 'discord', 'apple'];
    if (!validProviders.includes(provider)) {
      throw new Error(`Invalid provider: ${provider}`);
    }

    // Get OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: redirectToURL,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error('Failed to get OAuth URL from Supabase');
    }

    // Open OAuth URL in WebBrowser
    // WebBrowser.openAuthSessionAsync handles the OAuth flow
    // and automatically returns when OAuth completes
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectToURL);

    if (result.type !== 'success') {
      // User cancelled the OAuth flow or there was an error
      if (result.type === 'cancel') {
        throw new Error('OAuth flow was cancelled');
      }
      throw new Error(`OAuth flow failed: ${result.type}`);
    }

    // Extract URL from result
    const { url } = result;
    if (!url) {
      throw new Error('No redirect URL received from OAuth provider');
    }

    // Create session from the OAuth redirect URL
    // This extracts tokens and stores them in SecureStore automatically
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(url);

    // If exchange fails, try the legacy method
    // The session subscription in useAuth will detect the restored session
    if (sessionError) {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw sessionError;
      }
    }

    // Success! The useAuth hook will detect the new session
    // and trigger the redirect to /chat automatically

  } catch (error) {
    console.error(`OAuth sign-in failed for provider ${provider}:`, error);
    throw error;
  }
}