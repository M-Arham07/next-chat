"use client";

import { Message } from "@chat/shared";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";
import { useChatApp } from "./use-chat-app";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";


type useInfiniteScrollProps = (
    threadId: string,
    sentinelRef: RefObject<HTMLDivElement | null>,
    mainRef: RefObject<HTMLElement | null>,
    mounted: boolean,
    setLoadingState: Dispatch<SetStateAction<"idle" | "loading" | "failed">>

) => { retry: () => void }

export const useInfiniteScroll: useInfiniteScrollProps = (threadId, sentinelRef, mainRef, mounted, setLoadingState) => {

    const { addMessages, messages } = useChatApp();


    // compound cursor = { timestamp, msgId } of the OLDEST message we currently have
    // using both fields prevents ambiguity when two messages share the same timestamp
    const cursorRef = useRef<{ timestamp: string; msgId: string } | null>(null);


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


    const {
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError,
        refetch,
    } = useInfiniteQuery<Message[]>({
        queryKey: ["messages", threadId],
        queryFn: async ({ pageParam }) => {
            const params = new URLSearchParams({ limit: "20" });
            if (pageParam) {
                // Compound cursor: "{timestamp}_{msgId}"
                // Combining both fields prevents ambiguity when two messages
                // share the exact same timestamp.
                params.set("before", pageParam as string);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15_000);

            try {
                const res = await apiFetch(
                    `/api/threads/${threadId}/messages?${params.toString()}`,
                    { method: "GET", signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch messages");
                }

                const { messages: newMsgs }: { messages: Message[] } = await res.json();
                return newMsgs;
            } finally {
                clearTimeout(timeoutId);
            }
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => {
            // no more history
            if (!lastPage || lastPage.length === 0) return undefined;
            // Return compound cursor of the oldest message in this page
            const oldest = lastPage[0];
            return `${oldest.timestamp}_${oldest.msgId}`;
        },
        enabled: mounted,
        // We manage our own state via addMessages, so we don't want React Query to
        // re-render with its own data. We just use it for fetch orchestration.
        staleTime: Infinity,
    });


    // Sync loading/error states
    useEffect(() => {
        if (isFetchingNextPage) {
            setLoadingState("loading");
        } else if (isError) {
            setLoadingState("failed");
        } else {
            setLoadingState("idle");
        }
    }, [isFetchingNextPage, isError, setLoadingState]);


    // Override fetchNextPage to also handle addMessages + scroll preservation
    const fetchAndPrepend = async () => {
        // prevent fetching when all history is loaded
        if (!hasNextPage) return;

        const result = await fetchNextPage();

        if (result.data) {
            const pages = result.data.pages;
            const latestPage = pages[pages.length - 1];

            if (latestPage && latestPage.length > 0) {
                // Preserve scroll position: measure distance from bottom before prepend
                const container = mainRef.current;
                const scrollHeightBefore = container?.scrollHeight ?? 0;
                const scrollTopBefore = container?.scrollTop ?? 0;

                addMessages(latestPage, { appendToStart: true });

                // After React paints, restore scroll so the user stays at the same visual position
                requestAnimationFrame(() => {
                    if (!container) return;
                    const scrollHeightAfter = container.scrollHeight;
                    container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
                });
            }
        }
    };


    useEffect(() => {
        if (!sentinelRef.current || !mainRef.current || !mounted) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        fetchAndPrepend();
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
    }, [mounted, hasNextPage])

    return {
        retry: () => {
            // Reset failed state so the UI clears, then re-run the fetch
            refetch();
        }
    };
}
