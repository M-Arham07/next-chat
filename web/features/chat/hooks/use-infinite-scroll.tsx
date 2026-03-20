"use client";

import { Message } from "@chat/shared";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";
import { useChatApp } from "./use-chat-app";


type useInfiniteScrollProps = (
    threadId: string,
    sentinelRef: RefObject<HTMLDivElement | null>,
    mainRef: RefObject<HTMLElement | null>,
    mounted: boolean,
    setLoadingState: Dispatch<SetStateAction<"idle" | "loading" | "failed">>

) => void

export const useInfiniteScroll: useInfiniteScrollProps = (threadId, sentinelRef, mainRef, mounted, setLoadingState) => {

    const isFetchingRef = useRef<boolean>(false);
    const allFetchedRef = useRef<boolean>(false);

    // compound cursor = { timestamp, msgId } of the OLDEST message we currently have
    // using both fields prevents ambiguity when two messages share the same timestamp
    const cursorRef = useRef<{ timestamp: string; msgId: string } | null>(null);

    const { addMessages, messages } = useChatApp();


    // Keep cursor in sync with the oldest message in the thread
    useEffect(() => {
        const threadMsgs = messages?.[threadId];
        if (!threadMsgs || threadMsgs.length === 0) {
            cursorRef.current = null;
            return;
        }
        // messages array is sorted oldest → newest, so index 0 is the oldest
        const oldest = threadMsgs[0];
        cursorRef.current = { timestamp: oldest.timestamp, msgId: oldest.msgId };
    }, [messages, threadId]);


    useEffect(() => {
        if (!sentinelRef.current || !mainRef.current || !mounted) return;


        const fetchOlderMessages = async () => {

            // prevent concurrent fetches or fetching when done
            if (isFetchingRef.current || allFetchedRef.current) return;

            isFetchingRef.current = true;
            setLoadingState("loading");

            try {

                const params = new URLSearchParams({ limit: "20" });
                if (cursorRef.current) {
                    params.set("before", cursorRef.current.timestamp);
                    params.set("beforeId", cursorRef.current.msgId);
                }

                const res = await fetch(`/api/threads/${threadId}/messages?${params.toString()}`, { method: "GET" });

                if (!res.ok) {
                    setLoadingState("failed");
                    return;
                }

                const { messages: newMsgs }: { messages: Message[] } = await res.json();

                if (newMsgs.length === 0) {
                    // no more history
                    allFetchedRef.current = true;
                    setLoadingState("idle");
                    return;
                }

                // Preserve scroll position: measure distance from bottom before prepend
                const container = mainRef.current;
                const scrollHeightBefore = container?.scrollHeight ?? 0;
                const scrollTopBefore = container?.scrollTop ?? 0;

                addMessages(newMsgs, { appendToStart: true, resort: true });

                // After React paints, restore scroll so the user stays at the same visual position
                requestAnimationFrame(() => {
                    if (!container) return;
                    const scrollHeightAfter = container.scrollHeight;
                    container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
                });

                setLoadingState("idle");

            } catch {
                setLoadingState("failed");
            } finally {
                isFetchingRef.current = false;
            }
        };


        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        fetchOlderMessages();
                    }
                });
            },
            {
                root: mainRef.current,
                threshold: 0.01,
                rootMargin: "200px 0px 0px 0px"
            },
        )


        if (sentinelRef.current) {
            observer.observe(sentinelRef.current)
        }

        return () => {
            observer.disconnect();
        }
    }, [mounted])
}