import { useMemo } from "react";
import { Thread } from "@chat/shared";
import { MessageState } from "../../types";
import filterThreads from "../../lib/filter-threads";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { ActiveFilter } from "../../types/active-filter";

interface UseFilteredThreadsParams {
    threads: Thread[];
    messages: MessageState;
    profile: Profile;
    searchQuery: string;
    activeFilter: ActiveFilter;
}

export const useFilteredThreads = ({
    threads,
    messages,
    profile,
    searchQuery,
    activeFilter,
}: UseFilteredThreadsParams) => {
    // Filter threads based on search query and active filter
    const filteredThreads = useMemo(
        () => filterThreads(threads, messages, profile, searchQuery, activeFilter),
        [searchQuery, messages, activeFilter, threads]
    );

    return filteredThreads;
};
