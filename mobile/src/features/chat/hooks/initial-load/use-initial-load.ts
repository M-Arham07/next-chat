import { RefObject, useEffect } from "react";
import { Message, Thread } from "@chat/shared";
import { MessageState } from "../../types";
import { type SocketClientType } from "../../../lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";
import { apiClient } from "../../../lib/api-client";

interface UseInitialLoadParams {
    mounted: boolean;
    socketRef: RefObject<SocketClientType | null>;
    markMounted: () => void;
    setThreads: (threads: Thread[]) => void;
    set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) => void;
    setLoading: (loading: boolean) => void;
    profile: Profile;
}

export const useInitialLoad = ({
    mounted,
    markMounted,
    setThreads,
    set,
    setLoading,
    profile,
}: UseInitialLoadParams) => {
    useEffect(() => {
        const load = async () => {
            if (mounted) return;

            markMounted();
            setLoading(true);

            console.log("Fetching all chats");

            try {
                const response = await apiClient.get("/threads/inbox");
                const data = response.data;

                if (!data?.threads) throw new Error("No threads in response");

                setThreads(data.threads);

                // Transform messages to message state
                let result: MessageState = {};

                for (const msg of data.messages || []) {
                    (result[msg.threadId] ??= []).push(msg);
                }

                set("messages", result);
                setLoading(false);
            } catch (err) {
                if (err instanceof Error) {
                    console.error("[useInitialLoad] Error fetching chats:", err.message);
                }
                setLoading(false);
            }
        };

        load();
    }, [profile]);
};
