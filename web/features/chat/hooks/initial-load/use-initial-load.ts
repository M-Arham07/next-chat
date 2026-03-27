import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Thread } from "@chat/shared";
import { MessageState } from "../../types";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";

interface UseInitialLoadParams {
    mounted: boolean;
    socketRef: React.RefObject<SocketClientType | null>;
    markMounted: () => void;
    setThreads: (threads: Thread[]) => void;
    set: <K extends keyof ChatAppStore>(
        key: K,
        value: ChatAppStore[K]
    ) => void
    setLoading: (loading: boolean) => void;
    profile: Profile;
}

interface InboxData {
    threads: Thread[];
    messages: Array<{ threadId: string }>;
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
    markMounted,
    setThreads,
    set,
    setLoading,
    profile,
}: UseInitialLoadParams) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["inbox", profile?.id],
        queryFn: fetchInbox,
        enabled: !mounted && !!profile?.id,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!mounted && data) {
            markMounted();

            console.log("FETCHING ALL CHATS ")

            // RETURN TYPE WILL NOT BE NULL IN CASE OF OK RESPONSE

            setThreads(data.threads);

            // TRANSFORM MESSAGES TO message state eg : "threadId" : "message"

            let result: MessageState = {};

            for (const msg of data.messages) {
                (result[msg.threadId] ??= []).push(msg as any);
            }

            set("messages", result);
        }
    }, [data, mounted, markMounted, setThreads, set]);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    useEffect(() => {
        if (error) {
            console.error("[useChatApp] Error while fetching chats on initial load >>", error.message);
            setLoading(false);
            // handling! 
        }
    }, [error, setLoading]);
};
