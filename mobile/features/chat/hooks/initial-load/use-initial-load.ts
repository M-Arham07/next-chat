import { RefObject, useEffect } from "react";
import { Thread } from "@chat/shared";
import { MessageState } from "../../types/message-state";
import { type SocketClientType } from "../../lib/socket-client";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";
import { apiUrl } from "@/lib/api";
import { getSupabaseClient } from "@/supabase/client";

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

      try {
        // Get auth token to authenticate against the Next.js API
        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? "";

        const res = await fetch(apiUrl("/api/threads/inbox"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Bad response from SERVER");

        const data = await res.json();

        setThreads(data!.threads);

        let result: MessageState = {};
        for (const msg of data!.messages) {
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
