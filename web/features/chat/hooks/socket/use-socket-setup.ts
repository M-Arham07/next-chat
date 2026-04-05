import { useRef, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { getSocket, type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";

export const useSocketSetup = (profile: Profile) => {
    const socketRef = useRef<SocketClientType | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const initializeSocket = async () => {
            if (!socketRef.current) {
                console.log("NO CURRENT SOKCET")
                const { data } = await supabase.auth.getSession()
                const sessionToken = data.session?.access_token ?? "";
                console.log("sending token", sessionToken);
                socketRef.current = getSocket(sessionToken);
            }

            if (socketRef.current.connected) {
                console.log("Connected to WEBSOCKET [useChatApp]");
            }
        }

        initializeSocket();

        return () => {
            // socketRef?.current?.off("message:new");
            // socketRef?.current?.disconnect()
            // socketRef.current = null;
            // console.log("UNMOUNTED_CHAT_APP");   
        }
    }, [profile]);

    return socketRef;
};
