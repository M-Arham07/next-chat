import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from "@/supabase/client";
import { type Profile } from "@chat/shared/schema/profiles/profile"

type AuthContextType = {
  profile: Profile | null
  userId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  userId: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true;

    if (!supabase) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async (userId: string | undefined) => {
      if (!userId) {
        if (isMounted) {
          setUserId(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setUserId(userId);
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

    supabase.auth.getUser().then(({ data }) => {
      fetchProfile(data.user?.id);
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user?.id);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    }
  }, [])

  return (
    <AuthContext.Provider value={{ profile, userId, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
