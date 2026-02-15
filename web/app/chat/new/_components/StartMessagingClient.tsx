'use client'

import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from 'react'
import { UserInterface, type Thread } from '@chat/shared'
import { debounce } from '@/lib/debounce'
import { SearchBar } from './SearchBar'
import { ResultsList } from './ResultsList'
import { SelectedUsersScroller } from './SelectedUsersScroller'
import { CreateGroupModal } from './CreateGroupModal'
import { toast } from 'sonner'
import { createNewThread } from '@/features/chat/lib/create-thread'
import { useRouter } from 'next/navigation'

export function StartMessagingClient() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isGroupMode, setIsGroupMode] = useState(false)
  const [results, setResults] = useState<UserInterface[] | Thread[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([]);
  const [isGroupCreationMode, setIsGroupCreationMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const debouncedSearchRef = useRef<((query: string) => void) | null>(null);

  const router = useRouter();


  // Initialize debounced search
  useEffect(() => {
    const handleSearch = async (searchQuery: string) => {

      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      searchQuery = searchQuery.toLowerCase();

      try {
        setIsLoading(true)
        setIsError(false)



        const searchRoute = isGroupMode ? `threads?group_name=${searchQuery}` : `users?username=${searchQuery}`;

        const res = await fetch(`/api/search/${searchRoute}`, { method: "GET" });
        console.log(`Sent to /api/search/${searchRoute}`)

        if (!res.ok) throw new Error(`Failed to search for ${isGroupMode ? "threads" : "users"}`);


        const data = await res.json();

        // TODO: ZOD VALIDATE PARSE! 

        setResults(data as (UserInterface[] | Thread[]));



      } catch (error) {
        console.error('[StartMessagingClient] Search error:', error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    debouncedSearchRef.current = debounce(handleSearch, 400)
  }, [isGroupMode])

  const handleSearchChange = (newQuery: string) => {
    setQuery(newQuery)
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(newQuery)
    }
  }


  const handleModeChange = (newIsGroupMode: boolean) => {
    setIsGroupMode(newIsGroupMode)
    setQuery('')
    setResults([])
    setSelectedUsers([])
    setIsGroupCreationMode(false)
  }

  const handleUserAdd = (newUser: UserInterface) => {
    setSelectedUsers((prev) => {

      const alreadyExists = prev.some(user => user.username === newUser.username);

      if (alreadyExists) return prev;

      return [...prev, newUser];

    })
  }

  const handleUserRemove = (removedUsername: string) => {
    setSelectedUsers((prev) => {

      const updatedSelectedUsers = prev.filter(user => user.username !== removedUsername);

      return updatedSelectedUsers;

    })
  }


  const handeStartCreatingGroup = () => {


    if (selectedUsers.length < 2) {
      toast.error('Select at least two users to create a group', { position: "top-center" });
      return;
    }
    setShowModal(true)
  }

  const handleCancelGroupCreation = () => {
    if (selectedUsers.length > 0) {
      toast.error('Clear your selection first')
      return
    }
    setIsGroupCreationMode(false)
  }



  const handleCreateGroup = async (groupName: string, groupImage: string, setIsCreating: Dispatch<SetStateAction<boolean>>): Promise<void> => {

    setIsCreating(true);

    const particpantUsernames = [...new Set<string>(selectedUsers.map(u => u.username))];

    const createdThreadId = await createNewThread({ type: "group", particpantUsernames, groupName, groupImage });

    if (!createdThreadId) {
      toast.error("Failed to create group! Please try again");
      setIsCreating(false);
      return;
    }

    setShowModal(false)
    setSelectedUsers([])
    setIsGroupCreationMode(false)
    toast.success('Group created successfully');

    router.push(`/chat/${createdThreadId}`);

    return;



  }
  return (
    <>

      <SearchBar
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
        isGroupMode={isGroupMode}
        onModeChange={handleModeChange}
      />

      {isGroupCreationMode && selectedUsers.length > 0 && (
        <SelectedUsersScroller
          selectedUsers={selectedUsers}
          onRemoveUser={handleUserRemove}
          onStartCreatingGroup={handeStartCreatingGroup}
          onCancel={handleCancelGroupCreation}
        />
      )}

      <ResultsList
        isGroupMode={isGroupMode}
        results={results}
        isLoading={isLoading}
        isError={isError}
        onUserChat={() => { }}
        onGroupJoin={() => { }}
        onUserAdd={handleUserAdd}
        isGroupCreationMode={isGroupCreationMode}
      />

      {!isGroupMode && !isGroupCreationMode && (
        <div className="pt-4">
          <button
            onClick={() => setIsGroupCreationMode(true)}
            className="w-full rounded-lg border border-dashed px-4 py-3 text-center text-sm font-medium hover:bg-accent"
          >
            Create a Group
          </button>
        </div>
      )}

      {showModal && selectedUsers.length > 1 && (
        <CreateGroupModal
          selectedUsers={selectedUsers}
          onClose={() => setShowModal(false)}
          onCreateGroup={handleCreateGroup}
          onRemoveUser={handleUserRemove}
        />
      )}
    </>
  )
}

