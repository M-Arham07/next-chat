'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { UserInterface } from '@chat/shared'
import AvatarUpload from '@/features/upload-avatar/components/avatar.upload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { Loader2, ChevronLeft, X } from 'lucide-react'
import { fakeDelay } from '@/features/chat/lib/fake-delay'

interface CreateGroupModalProps {

  //Data
  selectedUsers: UserInterface[],

  // Functions : 
  onClose: () => void
  onCreateGroup: (groupName: string, groupImage: string, setIsCreating: Dispatch<SetStateAction<boolean>>,) => Promise<void>
  onRemoveUser: (username: string) => void
}

type ModalStep = 'review' | 'details' | 'confirm'

export function CreateGroupModal({
  selectedUsers,
  onClose,
  onCreateGroup,
  onRemoveUser
}: CreateGroupModalProps) {


  const [step, setStep] = useState<ModalStep>('review')
  const [groupName, setGroupName] = useState('')
  const [groupImage, setGroupImage] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [nameError, setNameError] = useState('')

  // idk why they are here ? 
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')



  const handleNextStep = () => {
    if (step === 'review') {
      setStep('details')
    } else if (step === 'details') {
      if (!groupName.trim()) {
        setNameError('Group name is required')
        return
      }
      setNameError('')
      setStep('confirm')
    }
  }

  const handleBack = () => {
    if (step === 'details') {
      setStep('review')
    } else if (step === 'confirm') {
      setStep('details')
    }
  }




  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle>Review Members</DialogTitle>
              <DialogDescription>
                These selectedUsers will be added to your group
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <motion.div
                    key={user._id.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-muted group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 shrink-0">
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRemoveUser(user.username)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle>Group Details</DialogTitle>
              <DialogDescription>
                Give your group a name and optional picture
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value)
                    setNameError('')
                  }}
                  className="h-10"
                />
                {nameError && (
                  <p className="text-xs text-destructive">{nameError}</p>
                )}
              </div>

              <AvatarUpload
                displayPicture={groupImage}
                setDisplayPicture={setGroupImage}
                setError={setErrorMessage}
                setSuccess={setSuccessMessage}
                avatarSize={120}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2 flex-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Review
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
              <DialogDescription>
                Ready to create "{groupName}"?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {groupImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 blur-xl" />
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border shadow-lg">
                      <img
                        src={groupImage}
                        alt={groupName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  GROUP NAME
                </p>
                <p className="text-sm font-medium">{groupName}</p>
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  MEMBERS ({selectedUsers.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id.toString()}
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-2 py-1"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isCreating}
                  className="gap-2 flex-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => onCreateGroup(groupName, (groupImage as string), setIsCreating)}
                  disabled={isCreating}
                  className="gap-2 flex-1"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCreating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
