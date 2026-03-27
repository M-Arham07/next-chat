import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/supabase/client";
import { type Profile } from "@chat/shared/schema/profiles/profile";

type AuthContextType = {
  profile: Profile;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  profile: {} as Profile,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    const fetchProfile = async (userId: string | undefined) => {
      if (!userId) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (isMounted) {
        if (!error && data) {
          setProfile(data as Profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        fetchProfile(session?.user?.id);
      }
    });

    supabase.auth.getUser().then(({ data }) => {
      fetchProfile(data.user?.id);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ profile: profile as Profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
