import { Message } from "@chat/shared";
import { useEffect, useRef, useState } from "react";
import { useChatApp } from "./use-chat-app";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";
import { getSupabaseClient } from "@/supabase/client";

type LoadingState = "idle" | "loading" | "failed";

export const useInfiniteMessages = (threadId: string, mounted: boolean) => {
  const { addMessages, messages } = useChatApp();
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

  const cursorRef = useRef<{ timestamp: string; msgId: string } | null>(null);

  // Keep cursor in sync with oldest message
  useEffect(() => {
    const threadMsgs = messages?.[threadId];
    if (!threadMsgs || threadMsgs.length === 0) {
      cursorRef.current = null;
      return;
    }
    const oldest = threadMsgs[0];
    cursorRef.current = { timestamp: oldest.timestamp, msgId: oldest.msgId };
  }, [messages, threadId]);

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isError, refetch } =
    useInfiniteQuery<Message[]>({
      queryKey: ["messages", threadId],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ limit: "20" });
        if (pageParam) params.set("before", pageParam as string);

        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? "";

        const res = await fetch(
          apiUrl(`/api/threads/${threadId}/messages?${params.toString()}`),
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch messages");

        const { messages: newMsgs }: { messages: Message[] } = await res.json();
        return newMsgs;
      },
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length === 0) return undefined;
        const oldest = lastPage[0];
        return `${oldest.timestamp}_${oldest.msgId}`;
      },
      enabled: mounted,
      staleTime: Infinity,
    });

  // Sync loading/error states
  useEffect(() => {
    if (isFetchingNextPage) setLoadingState("loading");
    else if (isError) setLoadingState("failed");
    else setLoadingState("idle");
  }, [isFetchingNextPage, isError]);

  const fetchOlderMessages = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    const result = await fetchNextPage();
    if (result.data) {
      const pages = result.data.pages;
      const latestPage = pages[pages.length - 1];
      if (latestPage && latestPage.length > 0) {
        addMessages(latestPage, { appendToStart: true });
      }
    }
  };

  return {
    loadingState,
    fetchOlderMessages,
    retry: () => refetch(),
  };
};
