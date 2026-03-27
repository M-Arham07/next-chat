import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Thread } from '@chat/shared';
import { MessageState } from '../../types/message-state';
import { type SocketClientType } from '@/features/chat/lib/socket-client';
import { Profile } from '@chat/shared/schema/profiles/profile';
import type { ChatAppStore } from '../../store/chatapp.store';
import { apiClient } from '@/lib/api-client';

interface UseInitialLoadParams {
  mounted: boolean;
  socketRef: React.RefObject<SocketClientType | null>;
  markMounted: () => void;
  setThreads: (threads: Thread[]) => void;
  set: <K extends keyof ChatAppStore>(key: K, value: ChatAppStore[K]) => void;
  setLoading: (loading: boolean) => void;
  profile: Profile | null;
}

interface InboxData {
  threads: Thread[];
  messages: Array<{ threadId: string; [key: string]: any }>;
}

const fetchInbox = async (): Promise<InboxData> => {
  const data = await apiClient.get('/threads/inbox');
  return data;
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
    queryKey: ['inbox', profile?.id],
    queryFn: fetchInbox,
    enabled: !mounted && !!profile?.id,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!mounted && data) {
      markMounted();

      console.log('FETCHING ALL CHATS');

      // Set threads from data
      setThreads(data.threads);

      // Transform messages to message state (threadId -> messages array)
      let result: MessageState = {};

      for (const msg of data.messages) {
        (result[msg.threadId] ??= []).push(msg as any);
      }

      set('messages', result);
    }
  }, [data, mounted, markMounted, setThreads, set]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      console.error('[useInitialLoad] Error while fetching chats on initial load >>', error.message);
      setLoading(false);
    }
  }, [error, setLoading]);
};
