import { useRef, useEffect } from "react";
import { getSocket, type SocketClientType } from "../../../lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { supabase } from "../../../lib/supabase";

export const useSocketSetup = (profile: Profile) => {
    const socketRef = useRef<SocketClientType | null>(null);

    useEffect(() => {
        const initializeSocket = async () => {
            if (!socketRef.current) {
                console.log("Initializing socket connection");
                try {
                    const {
                        data: { session },
                    } = await supabase.auth.getSession();
                    const sessionToken = session?.access_token ?? "";
                    console.log("Socket token ready");
                    socketRef.current = getSocket(sessionToken);
                } catch (error) {
                    console.error("Failed to initialize socket:", error);
                }
            }

            if (socketRef.current?.connected) {
                console.log("Connected to WebSocket [useChatApp]");
            }
        };

        initializeSocket();

        return () => {
            // Socket cleanup handled in socket-client
        };
    }, [profile]);

    return socketRef;
};
