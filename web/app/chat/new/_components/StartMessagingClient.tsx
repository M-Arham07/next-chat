'use client'

import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from 'react'
import { type Thread } from '@chat/shared'
import { Profile } from '@chat/shared/schema/profiles/profile'
import { debounce } from '@/lib/debounce'
import { SearchBar } from './SearchBar'
import { ResultsList } from './ResultsList'
import { SelectedUsersScroller } from './SelectedUsersScroller'
import { CreateGroupModal } from './CreateGroupModal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useChatApp } from '@/features/chat/hooks/use-chat-app'
import { CreateThreadSchemaResponse } from '@chat/shared/schema'
import { optimizeImage } from '@/lib/optimize-image'

export function StartMessagingClient() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isGroupMode, setIsGroupMode] = useState(false)
  const [results, setResults] = useState<Profile[] | Thread[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [isGroupCreationMode, setIsGroupCreationMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const debouncedSearchRef = useRef<((query: string) => void) | null>(null);

  const router = useRouter();

  const { addThread } = useChatApp();

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

        setResults(data as (Profile[] | Thread[]));



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

  const handleUserAdd = (newUser: Profile) => {
    setSelectedUsers((prev) => {

      const alreadyExists = prev.some(user => user.username === newUser.username);

      if (alreadyExists) return prev;

      return [...prev, newUser];

    })
  }

  const handleUserRemove = (removedUserId: string) => {
    setSelectedUsers((prev) => {

      const updatedSelectedUsers = prev.filter(user => user.id !== removedUserId);

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




  const handleCreateGroup = async (groupName: string, groupImage: File, setIsCreating: Dispatch<SetStateAction<boolean>>): Promise<void> => {



    setIsCreating(true);


    const otherParticipantUserIds = selectedUsers.map(u => u.id);





    const formData = new FormData();
    formData.append("type", "group");
    formData.append("otherParticipantUserIds", JSON.stringify(otherParticipantUserIds));
    formData.append("groupName", groupName);


    let createdThreadId: string;

    try {

      const optimizedImage = await optimizeImage(groupImage);
      formData.append("groupImage", optimizedImage);


      const res = await fetch("/api/threads", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const { success, createdThreadId: newThreadId } = CreateThreadSchemaResponse.parse(json);

      if (!success) throw new Error("BAD Response from server");

      createdThreadId = newThreadId! as string;



    }

    catch (err) {

      toast.error("Failed to create group! Please try again");
      setIsCreating(false);
      return;

    }



    setShowModal(false)
    setSelectedUsers([])
    setIsGroupCreationMode(false)
    toast.success('Group created successfully');


    // add new thread to state !



    // addThread(newThread, { appendToStart: true });

    router.push(`/chat/${createdThreadId}`);

    return;



  }

  const handleUserChat = async (userId: string, username: string): Promise<void> => {


    let createdThreadId: string;
    const formData = new FormData();
    formData.append("type", "direct");
    formData.append("otherParticipantUserIds", JSON.stringify([userId]));

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const { success, createdThreadId: newThreadId } = CreateThreadSchemaResponse.parse(json);

      if (!success) throw new Error("BAD Response from server");

      createdThreadId = newThreadId! as string;
    }
    catch (err) {
      toast.error(`Failed to start chat with ${username}`);
      return;

    }




    toast.success(`Starting chat with ${username}`);

    // add new thread to state !

    // addThread(createdThread, { appendToStart: true });
    // todo : realtime update via socket! 



    return router.push(`/chat/${createdThreadId}`)



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
          onCancel={() => setIsGroupCreationMode(false)}
        />
      )}

      <ResultsList
        isGroupMode={isGroupMode}
        results={results}
        isLoading={isLoading}
        isError={isError}
        onUserChat={handleUserChat}
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

