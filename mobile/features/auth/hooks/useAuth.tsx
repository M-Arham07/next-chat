'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '@/supabase/supabase-client';
import type { Profile } from '@chat/shared/schema/profiles/profile';

type AuthContextType = {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (userId: string | undefined) => {
      if (!userId) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (isMounted) {
          if (!fetchError && data) {
            setProfile(data as Profile);
          } else {
            setProfile(null);
          }
          setError(fetchError);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      fetchProfile(data.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user?.id);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile: profile as Profile | null,
        loading,
        error,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
