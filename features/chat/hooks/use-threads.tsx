"use client";
import { createContext, Dispatch, SetStateAction, use, useEffect, useMemo, useState } from "react";
import { ActiveFilter } from "../types/active-filter";
import { NavTab } from "@/app/(threads)/_components/layout/BottomNavigation";
import { Thread } from "@/packages/shared/types/threads";
import { useSession } from "next-auth/react";
import filterThreads from "../lib/filter-threads";
import { useMessagesHook } from "./use-messages";
import { useLoader } from "@/store/loader/use-loader";

export interface ThreadsHook {
    activeTab: NavTab,
    setActiveTab: Dispatch<SetStateAction<NavTab>>,
    filteredThreads: Thread[] | null,
    selectedThreadId: string | undefined,
    setSelectedThreadId: Dispatch<SetStateAction<string | undefined>>,
    searchQuery: string,
    setSearchQuery: Dispatch<SetStateAction<string>>

}


export function useThreadsHook(): ThreadsHook {


    const { data: session } = useSession();


   


    const [activeTab, setActiveTab] = useState<NavTab>("threads");
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
    const [threads, setThreads] = useState<Thread[] | null>(null);

    const { setLoading } = useLoader();


    useEffect(() => {

        setLoading(true);
        
      

        const fetchMockThreads = async () => {
            

            try {
                const res = await fetch(API_ENDPOINT, { method: "GET" });

                if (!res.ok) throw new Error("FAILED to fetch threads");
                const data = await res.json() as Thread[] | null;

                setThreads(data);

                setLoading(false);

            }
            catch (err) {
                setThreads(null);
                setLoading(false);
            }

        }


        fetchMockThreads();




        return () => {
            setLoading(false);
        }
    }, []);






    // TODO: FETCH 10 messages for each thread on initial load ?

    const messages = useMessagesHook();

    // fetch threads
    const API_ENDPOINT: string = "https://mocki.io/v1/353c786f-5fab-4af4-b388-f918b05e923d";





    // Filter threads based on search query and active filter
    const filteredThreads = useMemo(() => filterThreads(threads, messages, session, searchQuery, activeFilter),
        [searchQuery, messages, activeFilter, threads]);




    return {
        activeTab,
        setSearchQuery,
        searchQuery,
        setActiveTab,
        filteredThreads,
        selectedThreadId,
        setSelectedThreadId
    }












}
