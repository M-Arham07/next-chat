import { useRef, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { getSocket, type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { ensureRegisteredDevice } from "@/features/chat/lib/e2ee";

export const useSocketSetup = (profile: Profile | null) => {
    const socketRef = useRef<SocketClientType | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const initializeSocket = async () => {
            if (!profile?.id) {
                return;
            }

            await ensureRegisteredDevice(profile.id);

            if (!socketRef.current) {
                const { data } = await supabase.auth.getSession()
                const sessionToken = data.session?.access_token ?? "";
                socketRef.current = getSocket(sessionToken);
            }

        }

        initializeSocket();

        return () => {
            // socketRef?.current?.off("message:new");
            // socketRef?.current?.disconnect()
            // socketRef.current = null;
            // console.log("UNMOUNTED_CHAT_APP");   
        }
    }, [profile?.id]);

    return socketRef;
};
