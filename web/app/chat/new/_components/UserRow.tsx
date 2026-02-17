'use client'

import { UserInterface, Thread } from "@chat/shared";
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Plus, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface UserRowProps {
  user: UserInterface
  onChat: (username: string) => void
  onAdd?: (user: UserInterface) => void
  isGroupCreationMode?: boolean
  isSelected?: boolean
}

export function UserRow({
  user,
  onChat,
  onAdd,
  isGroupCreationMode,
  isSelected,
}: UserRowProps) {




  const handleAdd = () => {
    if (onAdd) {
      onAdd(user)
      toast.success(`Added ${user.name} to group`)
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
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </div>

      {isGroupCreationMode ? (
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          onClick={handleAdd}
          className="gap-2"
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={()=>onChat(user.username)}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </Button>
      )}
    </motion.div>
  )
}
