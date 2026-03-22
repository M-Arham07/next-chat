import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, Settings, MessageSquare } from 'lucide-react-native'
import { ChatListScreen } from '../screens/chat/ChatListScreen'
import { ChatDetailScreen } from '../screens/chat/ChatDetailScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Messages',
        }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.threadName || 'Chat',
        })}
      />
    </Stack.Navigator>
  )
}

export function ChatNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="ChatsTab"
        component={ChatStack}
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  )
}
