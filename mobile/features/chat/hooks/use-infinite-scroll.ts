import { Message } from '@chat/shared';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from 'react';
import { useChatAppStore } from '../store/chatapp.store';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface UseInfiniteScrollParams {
  threadId: string;
  sentinelRef: RefObject<any>;
  mainRef: RefObject<any>;
  mounted: boolean;
  setLoadingState: Dispatch<SetStateAction<'idle' | 'loading' | 'failed'>>;
}

export const useInfiniteScroll = ({
  threadId,
  sentinelRef,
  mainRef,
  mounted,
  setLoadingState,
}: UseInfiniteScrollParams) => {
  const { addMessages, messages } = useChatAppStore();

  // Compound cursor = { timestamp, msgId } of the OLDEST message
  const cursorRef = useRef<{ timestamp: string; msgId: string } | null>(null);

  // Keep cursor in sync with the oldest message in the thread
  useEffect(() => {
    const threadMsgs = messages?.[threadId];
    if (!threadMsgs || threadMsgs.length === 0) {
      cursorRef.current = null;
      return;
    }

    // Messages sorted oldest → newest, so index 0 is oldest
    const oldest = threadMsgs[0];
    cursorRef.current = { timestamp: oldest.timestamp, msgId: oldest.msgId };
  }, [messages, threadId]);

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isError, refetch } = useInfiniteQuery<Message[]>({
    queryKey: ['messages', threadId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });

      if (pageParam) {
        // Compound cursor: "{timestamp}_{msgId}"
        params.set('before', pageParam as string);
      }

      const data = await apiClient.get(`/threads/${threadId}/messages?${params.toString()}`);
      return data.messages || [];
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      // No more history
      if (!lastPage || lastPage.length === 0) return undefined;

      // Return compound cursor of oldest message in this page
      const oldest = lastPage[0];
      return `${oldest.timestamp}_${oldest.msgId}`;
    },
    enabled: mounted,
    staleTime: Infinity,
  });

  // Sync loading/error states
  useEffect(() => {
    if (isFetchingNextPage) {
      setLoadingState('loading');
    } else if (isError) {
      setLoadingState('failed');
    } else {
      setLoadingState('idle');
    }
  }, [isFetchingNextPage, isError, setLoadingState]);

  return {
    retry: refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};
