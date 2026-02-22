"use client";

import { LastTenMsgsResponse } from "@/app/api/last-ten-msgs/route";
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

    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const skipMessagesRef = useRef<number>(10);
    const allFetchedRef = useRef<boolean>(false);

    const { addMessages } = useChatApp();




    useEffect(() => {
        if (!sentinelRef.current || !mainRef.current || !mounted) return;


        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {

                    // early exit if the div isnt intersecting or all messages are fetched! 
                    if (!entry.isIntersecting || allFetchedRef.current) return;

                    // Clear any existing timeout
                    if (loadingTimeoutRef.current) {
                        clearTimeout(loadingTimeoutRef.current)
                    }



                    setLoadingState("loading");


                    const res = await fetch(`/api/last-ten-msgs?threadId=${threadId}&skip=${skipMessagesRef.current}`, { method: "GET" });

                    if (!res.ok) {
                        setLoadingState("failed");
                        clearTimeout(loadingTimeoutRef.current ?? "");
                        return;
                    }



                    const { messages: newMsgs }: LastTenMsgsResponse = await res.json();



                    // TODO: ZOD VALIDATE :





                    // append to start cuz received messages will be older than existing msgs! 
                    addMessages(newMsgs, { appendToStart: true });

                    setLoadingState("idle");

                    // ONLY UPDATE THE COUNT IF SOMETHING WAS ADDED : 

                    if (newMsgs.length === 0) {
                        // SET all messages fetched flag to true, to block further API requests! 
                        allFetchedRef.current = true;
                    }
                    else {

                        skipMessagesRef.current += 10

                    }

                    return;



                })
            },
            {
                root: null,
                threshold: 0.01,
                rootMargin: "0px 0px 1000px 0px"
            },
        )


        if (sentinelRef.current) {
            observer.observe(sentinelRef.current)
        }

        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
            }
            observer.disconnect();
        }
    }, [mounted])
}