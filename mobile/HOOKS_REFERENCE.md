# Chat App Hooks - React Native Ports

All custom hooks have been successfully ported from the Next.js web app to React Native with proper adaptations.

## ✅ Ported Hooks

### Socket Management

#### `use-socket-setup.ts`
Sets up Socket.io connection with Supabase session token.
- **Location**: `features/chat/hooks/socket/use-socket-setup.ts`
- **Purpose**: Initialize socket connection on mount
- **Returns**: `RefObject<SocketClientType | null>`
- **Dependencies**: Supabase client, getSocket function
- **Key Features**: Retrieves session token from Supabase auth

#### `use-socket-listeners.ts`
Registers real-time event listeners on the Socket.io connection.
- **Location**: `features/chat/hooks/socket/use-socket-listeners.ts`
- **Purpose**: Listen for message receives, deletions, and typing indicators
- **Parameters**: socketRef, profileRef, callback functions
- **Events Listened To**:
  - `message:received` - Incoming messages
  - `message:deleted` - Message deletion broadcasts
  - `typing:start` - User started typing
  - `typing:stop` - User stopped typing
- **Key Features**: Filters out self-messages for typing indicators

### Message Operations

#### `use-send-message.ts`
Handles sending messages (text, images, videos, voice, documents).
- **Location**: `features/chat/hooks/message-operations/use-send-message.ts`
- **Purpose**: Create message, validate, upload files, emit via socket
- **Parameters**: profileRef, socketRef, replyingToMsg, store methods
- **File Handling**:
  - Creates blob URLs for instant preview
  - Uploads files to Supabase
  - Tracks upload progress
  - Updates message content with real URL after upload
- **Validation**: Zod schema validation for all messages
- **File Size Limits**:
  - Default: 50MB (MAX_FILE_SIZE)
  - Video: 5MB for web (MAX_VIDEO_SIZE_FOR_BROWSER)
  - Images optimizable up to: 10MB

#### `use-delete-message.ts`
Handles message deletion with optimistic updates.
- **Location**: `features/chat/hooks/message-operations/use-delete-message.ts`
- **Purpose**: Delete messages and sync with backend
- **Features**:
  - Only allows deletion of own messages
  - Sets loading state while deleting
  - Reverts state on failure
  - Emits deletion via socket

#### `use-retry-message.ts`
Handles retrying failed messages.
- **Location**: `features/chat/hooks/message-operations/use-retry-message.ts`
- **Purpose**: Remove failed message and resend
- **Process**:
  1. Remove failed message from state
  2. Re-send using `handleSendMessage`

#### `handle-receive-message.ts`
Processes received messages with validation.
- **Location**: `features/chat/hooks/message-operations/handle-receive-message.ts`
- **Purpose**: Validate and add received messages to state
- **Features**:
  - Zod schema validation
  - Prevents duplicate/invalid messages
  - Logs echo messages (self-sent)

### Typing Indicators

#### `use-typing-state.ts`
Manages typing indicator state and emissions.
- **Location**: `features/chat/hooks/typing/use-typing-state.ts`
- **Purpose**: Debounce typing events and emit via socket
- **Features**:
  - Debounced typing (800ms)
  - Automatic stop after timeout
  - Prevents duplicate start events
  - Emits `typing:start` and `typing:stop` events

### Initial Data Loading

#### `use-initial-load.ts`
Loads initial chat data (threads and messages) on app startup.
- **Location**: `features/chat/hooks/initial-load/use-initial-load.ts`
- **Purpose**: Fetch inbox data and populate store
- **Data Fetched**:
  - All threads
  - Recent messages for each thread
- **Features**:
  - React Query integration
  - Global loading state management
  - Error handling and logging
  - Conditional enabling based on profile

### Infinite Scroll / Message Pagination

#### `use-infinite-scroll.ts`
Handles pagination of historical messages.
- **Location**: `features/chat/hooks/use-infinite-scroll.ts`
- **Purpose**: Load older messages as user scrolls up
- **Features**:
  - Compound cursor with timestamp + msgId
  - Prevents ambiguity when messages share timestamps
  - React Query `useInfiniteQuery`
  - Configurable batch size (20 messages)
  - Auto-retry on failure

### Filtering & Search

#### `use-filtered-threads.ts`
Memoized thread filtering and searching.
- **Location**: `features/chat/hooks/utils/use-filtered-threads.ts`
- **Purpose**: Filter threads by search query and active filter
- **Parameters**: threads, messages, profile, searchQuery, activeFilter
- **Filters**:
  - `all` - No filter
  - `unread` - Only unread messages
  - `groups` - Only group threads
- **Search**: Searches across participant names, group names, and message content

### Voice Recording

#### `use-voice-recorder.ts`
Mobile voice recording with pause/resume support.
- **Location**: `features/chat/hooks/message-bubble/use-voice-recorder.ts`
- **Purpose**: Record audio messages on mobile
- **Features**:
  - Microphone permission handling
  - Audio session configuration
  - Pause/resume recording
  - Duration tracking
  - Base64 encoding for upload
  - Error handling for permission/device issues
- **Return Type**: UseVoiceRecorderReturn with controls
- **Exported States**:
  - isRecording, isPaused, isStopping
  - durationSec, error, recordingUri
- **Exported Methods**:
  - start(), togglePause(), cancel(), send(), resetError()

### Main Chat App Hook

#### `use-chat-app.tsx`
Main orchestrating hook combining all chat functionality.
- **Location**: `features/chat/hooks/use-chat-app.tsx`
- **Purpose**: Provide complete ChatAppHook interface
- **Combines**:
  - Zustand store (all state)
  - Socket setup
  - Socket listeners
  - Initial data loading
  - Typing state
  - Message operations (send, delete, retry)
  - Thread filtering
- **Exports**:
  - `useChatApp()` - Hook to access chat context
  - `useChatAppHook()` - Internal hook implementation
  - `ChatAppProvider` - React Context provider component
- **Interface**: ChatAppHook extends ChatAppStore with:
  - handleSendMessage()
  - handleDeleteMessage()
  - handleRetryMessage()
  - handleTyping()
  - stopTypingEmit()
  - filteredThreads

## Usage Pattern

```typescript
// In your chat screens/components:
const {
  threads,
  messages,
  filteredThreads,
  handleSendMessage,
  handleDeleteMessage,
  handleRetryMessage,
  handleTyping,
  typingUsers,
  uploadingProgress,
} = useChatApp();

// Send a text message
await handleSendMessage(threadId, 'text', 'Hello world');

// Send a file
await handleSendMessage(threadId, 'image', imageFile);

// Delete a message
await handleDeleteMessage(message);

// Retry failed message
await handleRetryMessage(failedMessage);

// Handle typing
handleTyping(threadId); // Automatically debounced
```

## React Native Adaptations

### Key Changes from Web Version

1. **fetch() → apiClient**
   - All API calls go through `apiClient` singleton
   - Automatic base URL prepending
   - Supports FormData for file uploads

2. **Browser APIs → Expo APIs**
   - `navigator.mediaDevices` → `Audio` from `expo-av`
   - `FileSystem.readAsStringAsync` for file reading
   - Base64 encoding instead of Blob API

3. **Ref Handling**
   - Same pattern as web (useRef)
   - React Native compatible (no DOM refs)

4. **Async/Await**
   - All file operations properly awaited
   - Permission checks before mic access

5. **Error Handling**
   - Error objects adapted for mobile exceptions
   - Permission denial handling for microphone

## Testing Hooks

All hooks have built-in error handling and logging:
- Console.log for state changes and events
- Error states accessible via error parameter
- Validation with Zod schema on all messages

## Next Steps

1. Create root layout with ChatAppProvider wrapper
2. Create chat screens using these hooks
3. Implement UI components for message display
4. Add animations with react-native-reanimated
5. Test end-to-end message flow
