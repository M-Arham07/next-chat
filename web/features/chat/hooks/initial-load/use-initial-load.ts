import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Thread } from "@chat/shared";
import { Message } from "@chat/shared";
import { MessageState } from "../../types";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";
import { hydrateMessagesForDisplay } from "@/features/chat/lib/e2ee";

interface UseInitialLoadParams {
    mounted: boolean;
    recoveryReady: boolean;
    socketRef: React.RefObject<SocketClientType | null>;
    markMounted: () => void;
    setThreads: (threads: Thread[]) => void;
    set: <K extends keyof ChatAppStore>(
        key: K,
        value: ChatAppStore[K]
    ) => void
    setLoading: (loading: boolean) => void;
    profile: Profile | null;
}

interface InboxData {
    threads: Thread[];
    messages: Message[];
}

const fetchInbox = async (): Promise<InboxData> => {
    const res = await fetch("/api/threads/inbox", {
        method: "GET"
    });

    if (!res.ok) throw new Error("Bad response from SERVER");

    return res.json();
};

export const useInitialLoad = ({
    mounted,
    recoveryReady,
    markMounted,
    setThreads,
    set,
    setLoading,
    profile,
}: UseInitialLoadParams) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["inbox", profile?.id],
        queryFn: fetchInbox,
        enabled: !mounted && !!profile?.id && recoveryReady,
        staleTime: Infinity,
    });

    useEffect(() => {
        const hydrateInbox = async () => {
            if (!mounted && data) {
                markMounted();
                setThreads(data.threads);

                if (!profile?.id) {
                    return;
                }

                const hydratedMessages = await hydrateMessagesForDisplay(profile.id, data.messages);
                const result: MessageState = {};

                for (const msg of hydratedMessages) {
                    (result[msg.threadId] ??= []).push(msg);
                }

                set("messages", result);
            }
        };

        void hydrateInbox();
    }, [data, mounted, markMounted, setThreads, set, profile?.id]);

    useEffect(() => {
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading, setLoading]);

    useEffect(() => {
        if (error) {
            console.error("[useChatApp] Error while fetching chats on initial load >>", error.message);
            setLoading(false);
            // handling! 
        }
    }, [error, setLoading]);
};
