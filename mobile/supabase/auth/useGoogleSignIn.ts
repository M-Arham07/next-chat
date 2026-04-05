import Constants from 'expo-constants';

import { createClient } from '../client';

export function canUseNativeGoogleSignIn() {
  return !__DEV__ && Constants.executionEnvironment !== 'storeClient';
}

export function useGoogleSignIn() {
  const handleGoogleSignIn = async () => {
    if (!canUseNativeGoogleSignIn()) {
      throw new Error('Native Google Sign-In is only available in production compiled builds');
    }

    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');

    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('No ID token received from Google');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };
  return { handleGoogleSignIn };
}
