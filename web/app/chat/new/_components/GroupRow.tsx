'use client'

import { Thread } from '@chat/shared'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface GroupRowProps {
  thread: Thread
  onJoin?: (threadId: string) => void
}

export function GroupRow({ thread, onJoin }: GroupRowProps) {
  const handleJoin = () => {
    if (onJoin) {
      console.log(`Join req sent to ${thread.threadId}`)
      toast.success(`Joined ${thread.groupName}`)
      onJoin(thread.threadId)
    }
  }

  return (
    <motion.div
      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={thread.groupImage || ''} alt={thread.groupName} />
          <AvatarFallback>{thread.groupName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{thread.groupName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {thread.particpants.length} members
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleJoin}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Join
      </Button>
    </motion.div>
  )
}
