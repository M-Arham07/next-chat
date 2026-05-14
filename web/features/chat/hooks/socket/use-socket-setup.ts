import { useRef, useEffect } from "react";
import { createRealtimeChatClient, type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { ensureRegisteredDevice } from "@/features/chat/lib/e2ee";

export const useSocketSetup = (profile: Profile | null) => {
    const socketRef = useRef<SocketClientType | null>(null);

    if (profile?.id && !socketRef.current) {
        socketRef.current = createRealtimeChatClient();
    }

    useEffect(() => {
        const initializeRealtime = async () => {
            if (!profile?.id) {
                return;
            }

            await ensureRegisteredDevice(profile.id);
            socketRef.current?.setCurrentUser(profile.id);

        };

        void initializeRealtime();

        return () => {
            if (!profile?.id) {
                return;
            }

            void socketRef.current?.dispose();
            socketRef.current = null;
        };
    }, [profile?.id]);

    return socketRef;
};
