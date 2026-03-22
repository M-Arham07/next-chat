import { RefObject, useEffect, useRef } from "react";
import { Message, Thread } from "@chat/shared";
import { MessageState } from "../../types";
import { type SocketClientType } from "@/features/chat/lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";

interface UseInitialLoadParams {
    mounted: boolean;
    socketRef: RefObject<SocketClientType | null>;
    markMounted: () => void;
    setThreads: (threads: Thread[]) => void;
    set: <K extends keyof ChatAppStore>(
        key: K,
        value: ChatAppStore[K]
    ) => void
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

            console.log("FETCHING ALL CHATS ")

            try {
                const res = await fetch("/api/threads/inbox", {
                    method: "GET"
                });

                //TODO: ZOD VALIDATE?

                if (!res.ok) throw new Error("Bad response from SERVER");

                const data = await res.json();

                // RETURN TYPE WILL NOT BE NULL IN CASE OF OK RESPONSE

                setThreads(data!.threads);

                // TRANSFORM MESSAGES TO message state eg : "threadId" : "message"

                let result: MessageState = {};

                for (const msg of data!.messages) {
                    (result[msg.threadId] ??= []).push(msg);
                }

                set("messages", result);

                setLoading(false);
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error("[useChatApp] Error while fetching chats on initial load >>", err.message);
                }

                setLoading(false);

                // handling! 
            }
        }

        load();
    }, [profile]);
};
