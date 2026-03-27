import { useRef, useEffect } from "react";
import { getSupabaseClient } from "@/supabase/client";
import { getSocket, type SocketClientType } from "../../lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";

export const useSocketSetup = (profile: Profile) => {
  const socketRef = useRef<SocketClientType | null>(null);

  useEffect(() => {
    const initializeSocket = async () => {
      if (!socketRef.current) {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const sessionToken = data.session?.access_token ?? "";
        socketRef.current = getSocket(sessionToken);
      }

      if (socketRef.current.connected) {
        console.log("Connected to WEBSOCKET [useChatApp]");
      }
    };

    initializeSocket();
  }, [profile]);

  return socketRef;
};
