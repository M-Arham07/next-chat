'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Users2 } from 'lucide-react'

interface SearchBarProps {
  onSearchChange: (query: string) => void
  isLoading: boolean
  isGroupMode: boolean
  onModeChange: (isGroupMode: boolean) => void
}

export function SearchBar({
  onSearchChange,
  isLoading,
  isGroupMode,
  onModeChange,
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      onSearchChange(value)
    },
    [onSearchChange],
  )

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder={isGroupMode ? 'Search groups...' : 'Search users...'}
        value={query}
        onChange={handleChange}
        disabled={isLoading}
        className="h-10"
      />
      <div className="flex gap-2">
        <Button
          variant={!isGroupMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            onModeChange(false)
            setQuery('')
          }}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Users
        </Button>
        <Button
          variant={isGroupMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            onModeChange(true)
            setQuery('')
          }}
          className="gap-2"
        >
          <Users2 className="h-4 w-4" />
          Groups
        </Button>
      </div>
    </div>
  )
}
