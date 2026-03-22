import React from 'react'
import { useAuth } from '../providers/AuthProvider'
import { AuthNavigator } from './AuthNavigator'
import { ChatNavigator } from './ChatNavigator'

export function RootNavigator() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return null // Replace with loading screen if needed
  }

  return session ? <ChatNavigator /> : <AuthNavigator />
}
