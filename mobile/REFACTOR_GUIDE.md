# React Native Refactoring Guide

This document outlines the remaining work needed to complete the mobile app refactoring.

## Current Status

✅ **Completed:**
- Mobile foundation setup (package.json with all dependencies)
- Supabase client for React Native (AsyncStorage-based session persistence)
- API client utility for calling Next.js API routes
- Auth Provider with session management
- Theme Provider
- React Navigation setup (bottom tab + stack navigation)
- Placeholder screens (Login, Register, Chat List, Chat Detail, Profile)
- Basic Zustand store for chat app state

⚠️ **In Progress / Needs Completion:**
- Business logic hooks (socket, message operations, etc.)
- Socket.io integration with Next.js WebSocket server
- Message handling and real-time updates
- File upload functionality
- Complete UI implementation with React Native Reusables

## Next Steps

### 1. Complete Chat Business Logic Hooks

Copy these files from `/web/features/chat/hooks/` to `/mobile/src/features/chat/hooks/`:

```
web/features/chat/hooks/
├── socket/
│   ├── use-socket-setup.ts → Copy with modified imports
│   └── use-socket-listeners.tsx → Copy with modified imports
├── initial-load/
│   └── use-initial-load.ts → Copy (uses apiClient instead of fetch)
├── typing/
│   └── use-typing-state.ts → Copy as-is
├── message-operations/
│   ├── use-send-message.ts → Copy (remove toast, use Alert)
│   ├── use-delete-message.ts → Copy (remove toast, use Alert)
│   ├── use-retry-message.ts → Copy as-is
│   └── handle-receive-message.ts → Copy as-is
└── utils/
    └── use-filtered-threads.ts → Copy as-is
```

**Key changes for React Native:**
- Replace `toast` (sonner) with `Alert` from react-native
- Replace `fetch` with `apiClient` from `../../lib/api-client`
- Replace Next.js Supabase client imports with React Native client
- Keep all business logic identical

### 2. Copy Library Utilities

Copy these files from `/web/features/chat/lib/` to `/mobile/src/features/chat/lib/`:

```
web/features/chat/lib/
├── socket-client.ts → Copy (test Socket.io compatibility)
├── file-utils.ts → Copy (adapt for React Native file handling)
├── upload-utils.ts → Copy (may need adjustments)
└── ... other utilities
```

### 3. Complete Main Chat App Hook

The main hook at `/mobile/src/features/chat/hooks/use-chat-app.tsx` needs to:
- Import all the extracted hooks above
- Combine them into a single context (like web version)
- Provide a ChatAppProvider and useChatApp hook

### 4. Implement React Native UI Components

Replace placeholder screens with actual UI:

**LoginScreen & RegisterScreen:**
- Use React Native Reusables components (Button, Input, etc.)
- Implement OAuth provider buttons (Google, GitHub, Apple) using Supabase
- Add proper error handling

**ChatListScreen:**
- Use the actual `useChatApp` hook to get threads
- Implement search/filter functionality
- Add create new chat functionality

**ChatDetailScreen:**
- Display messages from store
- Implement message sending with `handleSendMessage`
- Add typing indicators
- Support file uploads with media picker

**ProfileScreen:**
- Display user info from Supabase auth
- Implement profile editing
- Add settings

### 5. Socket.io Integration

Ensure Socket.io client is properly configured:
- Test connection to `/realtime` server
- Verify message receiving/sending
- Test typing indicators
- Test message deletion

### 6. Initialize React Native Reusables

Run after all dependencies are installed:
```bash
cd mobile
npm install
npx @react-native-reusables/cli@latest init
```

This will generate UI component stubs that match shadcn/ui patterns for React Native.

### 7. File Upload & Media Handling

Implement file upload for:
- Images (using expo-image-picker)
- Videos (using expo-image-picker)
- Documents (using expo-document-picker)

Connect to the same `GetFileUrl` utility from web (in shared or adapted for mobile).

## Environment Setup

1. Copy `.env.example` to `.env` or `.env.local`:
```bash
cp .env.example .env
```

2. Add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_API_URL=http://localhost:3000  # or production URL
```

## Running the App

```bash
cd mobile
npm install
npm start
```

Then choose:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

## Architecture Notes

**Shared Code (No Changes):**
- `/shared` - Types, schemas, constants
- `/realtime` - Backend Socket.io server
- Business logic hooks (copied to mobile with minimal changes)
- Zustand stores (identical)

**Mobile-Specific Code:**
- `/mobile/src/lib/supabase.ts` - React Native Supabase setup
- `/mobile/src/lib/api-client.ts` - Next.js API client
- `/mobile/src/providers/` - Auth, Theme providers
- `/mobile/src/navigation/` - React Navigation setup
- `/mobile/src/screens/` - UI components

**Key Differences from Web:**
1. React Native components instead of HTML
2. Supabase AsyncStorage instead of browser storage
3. React Navigation instead of Next.js routing
4. Expo for platform-specific features
5. All API calls go through Next.js routes (no direct Supabase calls except auth)

## Testing Checklist

- [ ] App launches without crashes
- [ ] Login/Register works with Supabase
- [ ] Can fetch chat threads from API
- [ ] Can send/receive messages via Socket.io
- [ ] Typing indicators work
- [ ] Message deletion works
- [ ] File uploads work
- [ ] Navigation between screens works
- [ ] Session persistence across app restart
- [ ] Logout clears session

## Common Issues & Solutions

**Socket.io connection fails:**
- Ensure `/realtime` server is running
- Check `EXPO_PUBLIC_API_URL` points to correct server
- Verify CORS settings if running on different hosts

**Supabase auth fails:**
- Verify env variables are set correctly
- Check AsyncStorage permissions
- Ensure Supabase project has auth enabled

**API calls fail:**
- Check Next.js server is running
- Verify auth token is being sent in headers
- Check CORS headers allow mobile requests

## References

- [React Native Reusables Docs](https://reactnativereusables.com/)
- [Supabase React Native Guide](https://supabase.com/docs/reference/react)
- [React Navigation Docs](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)
- [Socket.io Client Docs](https://socket.io/docs/v4/client-api/)
