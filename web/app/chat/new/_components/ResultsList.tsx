'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { UserInterface,Thread } from '@chat/shared'
import { UserRow } from './UserRow'
import { GroupRow } from './GroupRow'
import { Skeleton } from '@/components/ui/skeleton'

interface ResultsListProps {
  isGroupMode: boolean
  results: UserInterface[] | Thread[]
  isLoading: boolean
  isError: boolean
  onUserChat: (username: string) => void
  onGroupJoin?: (threadId: string) => void
  onUserAdd?: (user: UserInterface) => void
  isGroupCreationMode?: boolean
  selectedUsers?: Set<string>
}

function isUserInterface(item: unknown): item is UserInterface {
  return (item as UserInterface).username !== undefined
}

export function ResultsList({
  isGroupMode,
  results,
  isLoading,
  isError,
  onUserChat,
  onGroupJoin,
  onUserAdd,
  isGroupCreationMode,
  selectedUsers,
}: ResultsListProps) {
  if (isError) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Something went wrong. Please try again.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {isGroupMode ? 'No groups found' : 'No users found'}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {results.map((item) => {
          const key = isUserInterface(item)
            ? item._id.toString()
            : (item as Thread).threadId
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
            >
              {isGroupMode ? (
                <GroupRow
                  thread={item as Thread}
                  onJoin={onGroupJoin}
                />
              ) : (
                <UserRow
                  user={item as UserInterface}
                  onChat={onUserChat}
                  onAdd={onUserAdd}
                  isGroupCreationMode={isGroupCreationMode}
                  isSelected={selectedUsers?.has(
                    (item as UserInterface)._id.toString(),
                  )}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
