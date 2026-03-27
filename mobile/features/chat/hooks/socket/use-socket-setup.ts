import { useRef, useEffect } from 'react';
import { supabase } from '@/supabase/supabase-client';
import { getSocket, type SocketClientType } from '@/features/chat/lib/socket-client';
import { Profile } from '@chat/shared/schema/profiles/profile';

export const useSocketSetup = (profile: Profile | null) => {
  const socketRef = useRef<SocketClientType | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const initializeSocket = async () => {
      if (!socketRef.current) {
        const { data } = await supabase.auth.getSession();
        const sessionToken = data.session?.access_token ?? '';

        if (!sessionToken) {
          console.warn('[useSocketSetup] No session token available');
          return;
        }

        socketRef.current = getSocket(sessionToken);
      }

      if (socketRef.current?.connected) {
        console.log('[useSocketSetup] Connected to socket');
      }
    };

    initializeSocket();

    return () => {
      // Cleanup on unmount - optionally disconnect
      // socketRef.current?.disconnect();
    };
  }, [profile?.id]);

  return socketRef;
};
