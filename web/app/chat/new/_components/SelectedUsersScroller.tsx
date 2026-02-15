'use client'

import { useEffect, useState, useRef } from 'react'
import { UserInterface } from '@chat/shared'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SelectedUsersScrollerProps {

  //Data:
  selectedUsers: UserInterface[]

  // Functions: 
  onRemoveUser: (userId: string) => void
  onCreateGroup: () => void
  onCancel: () => void
}

export function SelectedUsersScroller({
  selectedUsers,
  onRemoveUser,
  onCreateGroup,
  onCancel,
}: SelectedUsersScrollerProps) {








  const scrollContainerRef = useRef<HTMLDivElement>(null)



  // Auto-scroll to end when new selectedUsers are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth
    }
  }, [selectedUsers])

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
      <div className="text-xs font-semibold text-muted-foreground">
        {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          div[class*="overflow-x-auto"] {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          div[class*="overflow-x-auto"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <AnimatePresence mode="popLayout">
          {selectedUsers.map((user) => (
            <motion.div
              key={user._id.toString()}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.1 }}
              className="flex shrink-0 items-center gap-2 rounded-full border bg-background px-2 py-1"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{user.name}</span>
              <button
                onClick={() => onRemoveUser(user.username)}
                className="rounded-full p-1 hover:bg-muted"
                aria-label={`Remove ${user.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={onCreateGroup}
          className="flex-1"
        >
          Next: Name Group
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
