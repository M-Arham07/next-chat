"use client";
import { createContext, Dispatch, SetStateAction, use, useEffect, useMemo, useState } from "react";
import { ActiveFilter } from "../types/active-filter";
import { Thread } from "@/packages/shared/types/threads";
import { useSession } from "next-auth/react";
import filterThreads from "../lib/filter-threads";
import { useLoader } from "@/store/loader/use-loader";
import { NavTab } from "@/app/chat/_components/layout/BottomNavigation";

export interface ThreadsHook {
    activeTab: NavTab,
    setActiveTab: Dispatch<SetStateAction<NavTab>>,
    threads:Thread[]
    filteredThreads: Thread[] | null,
    selectedThreadId: string | undefined,
    setSelectedThreadId: Dispatch<SetStateAction<string | undefined>>,
    searchQuery: string,
    setSearchQuery: Dispatch<SetStateAction<string>>,
    activeFilter: ActiveFilter,
    setActiveFilter: Dispatch<SetStateAction<ActiveFilter>>

}


export function useThreadsHook(): ThreadsHook {


    const { data: session } = useSession();







    // TODO: FETCH 10 messages for each thread on initial load ?

    // fetch threads
    const API_ENDPOINT: string = "https://mocki.io/v1/353c786f-5fab-4af4-b388-f918b05e923d";





 




    return {
        activeTab,
        setSearchQuery,
        searchQuery,
        setActiveTab,
        filteredThreads,
        selectedThreadId,
        setSelectedThreadId,
        activeFilter,
        setActiveFilter
    }












}
