# App Navigation & Screens Architecture

## Overview

Root layout wraps entire app with all necessary providers and handles auth-based routing:

```
RootLayout
├── GestureHandlerRootView (gesture support)
├── SafeAreaProvider (safe area handling)
├── QueryClientProvider (react-query)
├── LoaderContextProvider (global loading)
├── AuthProvider (authentication)
├── ChatAppProvider (chat context with all hooks)
└── RootLayoutNav (routing logic)
```

## Navigation Structure

### Route Tree

```
/
├── register/              (Auth Flow - shown when not authenticated)
│   ├── index.tsx         (Login/branding screen)
│   ├── username.tsx      (Username setup)
│   ├── avatar.tsx        (Avatar upload)
│   └── onboarding/       (Optional onboarding)
│
└── chat/                 (Main Chat - shown when authenticated)
    ├── (threads)/                  (Thread group)
    │   ├── index.tsx              (Inbox/threads list)
    │   └── [threadId]/
    │       └── index.tsx          (Individual thread/messages)
    │
    ├── new/             (New message modals)
    │   ├── index.tsx   (Search users)
    │   └── create-group.tsx (Create group)
    │
    └── +not-found.tsx   (Catch-all)
```

## Screen Details

### Auth Flow (Register)

#### `app/register/index.tsx` - Login Screen
- **Purpose**: Initial authentication & branding
- **Displays**: BrandingSection or LoginForm based on state
- **Components**: BrandingSection (branding), LoginForm (OAuth)
- **Navigation**: 
  - → `/register/username` after OAuth
  - → `/register/avatar` after username
  - → `/register/onboarding/` optional
  - → `/chat` after complete auth

#### `app/register/username.tsx` - Username Setup
- **Purpose**: Set initial username
- **Features**: Username availability check
- **Navigation**: 
  - → `/register/avatar` on success
  - ← Back to login

#### `app/register/avatar.tsx` - Avatar Upload
- **Purpose**: Upload profile picture
- **Features**: 
  - Image picker
  - Image optimization
  - Upload to Supabase
- **Navigation**:
  - → `/register/onboarding/` or `/chat` on success
  - ← Back to username

### Chat Flow

#### `app/chat/(threads)/index.tsx` - Threads/Inbox List
- **Purpose**: Main chat inbox - shows all conversations
- **Features**:
  - List of threads with latest message preview
  - Unread count badges
  - Filter tabs (All, Unread, Groups)
  - Search functionality
  - New message button
- **Data**:
  - Uses `useChatApp()` for threads, messages, filteredThreads
  - Uses `useLoader()` for global loading state
- **Actions**:
  - Tap thread → navigate to `/chat/(threads)/[threadId]`
  - Tap + button → navigate to `/chat/new`
- **Provides**: 
  - Threads list with real-time updates
  - Instant filtering by search/active filter
  - Unread indicators

#### `app/chat/(threads)/[threadId]/index.tsx` - Message View
- **Purpose**: Display messages for a specific thread
- **Features**:
  - Infinite scroll pagination (up for older messages)
  - Message bubbles with status indicators
  - Chat input with send button
  - Typing indicators
  - Delete message action
  - Retry failed messages
  - Upload progress for media
- **Hooks Used**:
  - `useChatApp()` - main chat operations
  - `useInfiniteScroll()` - pagination
- **Message Display**:
  - Shows sender's profile picture
  - Status badges (sending, sent, failed)
  - Retry button on failed messages
  - Progress bar during upload
- **Input**:
  - Text input with multiline support
  - Handles typing indicators (debounced)
  - Send button disabled until text entered
- **Navigation**:
  - Back button → returns to threads list

#### `app/chat/new/index.tsx` - Search & Start New Message
- **Purpose**: Find users to chat with
- **Features**:
  - Debounced search (300ms)
  - User list with selection
  - Single user → direct message button
  - Multiple users → create group button
  - Selected users shown as tags
- **API**: 
  - `GET /search/users?q=` - search users
- **Navigation**:
  - Select 1 user + send → creates direct thread
  - Select 2+ users + create group → `/chat/new/create-group`
  - Back → returns to threads

#### `app/chat/new/create-group.tsx` - Create Group
- **Purpose**: Finalize group creation
- **Features**:
  - Input group name
  - Display selected members
  - Create button
- **API**:
  - `POST /threads` - create thread with participants
- **Navigation**:
  - Create group → `/chat/(threads)/[threadId]` (new thread)
  - Back → returns to search

## Auth-Based Routing Logic

Located in `app/_layout.tsx` (RootLayoutNav component):

```typescript
useEffect(() => {
  if (!authLoading) {
    if (!isAuthenticated && !inRegisterFlow) {
      // Not authenticated and not in register flow - redirect to register
      router.replace('/register');
    } else if (isAuthenticated && inRegisterFlow) {
      // Authenticated and in register flow - redirect to chat
      router.replace('/chat');
    }
  }
}, [isAuthenticated, authLoading, inRegisterFlow, router]);
```

**Rules**:
1. If **not authenticated** and **not in register flow** → force to `/register`
2. If **authenticated** and **in register flow** → force to `/chat`
3. Otherwise → stay on current route

## Shared Data Flow

All screens have access to shared state via `useChatApp()`:

```typescript
const {
  threads,              // All threads
  messages,            // Messages by threadId
  typingUsers,         // Typing indicators by threadId
  uploadingProgress,   // Upload progress by msgId
  filteredThreads,     // Search/filtered threads
  
  handleSendMessage,   // Send message
  handleDeleteMessage, // Delete message
  handleRetryMessage,  // Retry failed message
  handleTyping,        // Emit typing start
  stopTypingEmit,      // Emit typing stop
  
  set,                 // Generic state setter
} = useChatApp();
```

## Layout Hierarchy

```
app/_layout.tsx (RootLayout)
├── Providers wrapper
└── RootLayoutNav
    └── Stack (Expo Router)
        ├── register/_layout.tsx
        │   └── Stack
        │       ├── index.tsx (Login)
        │       ├── username.tsx
        │       ├── avatar.tsx
        │       └── onboarding/
        │
        └── chat/_layout.tsx
            └── Stack
                ├── (threads)/_layout.tsx
                │   └── Stack
                │       ├── index.tsx (Inbox)
                │       └── [threadId]/index.tsx (Messages)
                │
                ├── new/
                │   ├── index.tsx (Search)
                │   └── create-group.tsx
                │
                └── +not-found.tsx
```

## Key Implementation Notes

### Routing Strategy
- **Conditional rendering** based on `isAuthenticated` from `useAuth()`
- **Auth state persisted** via Supabase + AsyncStorage
- **No manual redirect needed** in screens - handled at root level

### State Management
- **Zustand store** for chat data (messages, threads)
- **React Query** for API data caching
- **React Context** for AuthProvider, LoaderProvider
- **Socket.io** for real-time updates

### Performance
- **Lazy loading** of screens via route structure
- **Memoized filtering** in useFilteredThreads
- **Debounced search** (300ms) to reduce API calls
- **Infinite scroll** for message pagination

### Error Handling
- **Try-catch** in mutation handlers
- **Error states** in message status (failed, retry)
- **Loading indicators** during API calls
- **User feedback** via status badges and actions

## Next Steps

1. Implement missing auth screens:
   - `/register/username.tsx`
   - `/register/avatar.tsx`
   - `/register/onboarding/index.tsx`

2. Add UI components:
   - Message bubbles for different types (image, video, voice)
   - Chat input with attachment picker
   - Typing indicator animation
   - Date separator in message thread

3. Implement media handling:
   - Image picker integration
   - Voice recording
   - Video support
   - Document uploads

4. Add animations:
   - Message entrance/exit
   - Typing indicator
   - Smooth transitions
   - Loading states

5. Connect to backend APIs:
   - Verify endpoint paths match backend
   - Handle error responses
   - Implement pagination properly
