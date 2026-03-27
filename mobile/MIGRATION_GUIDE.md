# Web to React Native Expo Migration Guide

## Overview
This document outlines the conversion of your Next.js chat app to a React Native Expo app while preserving all functionality, business logic, API calls, and real-time features.

## ✅ Completed Steps

### 1. Project Setup & Configuration
- ✅ Updated `mobile/package.json` with all required dependencies including:
  - `@tanstack/react-query` - Data fetching
  - `zustand` - State management (store)
  - `socket.io-client` - Real-time messaging
  - `@supabase/supabase-js` - Authentication & database
  - `react-hook-form` & `zod` - Form handling & validation
  - `react-native-reanimated` - Modern animations (replacing Framer Motion)
  - `expo-image-picker`, `expo-av`, `expo-file-system` - Media handling
  - All necessary UI primitives and utilities

- ✅ Updated `app.json` with:
  - Proper permissions configuration for iOS and Android
  - Plugin setup for image picker, audio, etc.
  - Correct app name and slug

- ✅ Created `.env.local` template for environment variables

### 2. API Layer
- ✅ Created `lib/api-client.ts` with:
  - `ApiClient` class for configurable API requests
  - `buildApiUrl()` - Constructs full API URLs
  - `getApiBaseUrl()` & `getSocketUrl()` - Environment-based URL resolution
  - Support for FormData uploads (for avatar/media uploads)
  - Singleton API client instance

### 3. Supabase Integration
- ✅ Created `lib/supabase-client.ts` with:
  - Configured Supabase client for React Native
  - AsyncStorage persistence for auth tokens
  - Auto-refresh token support

### 4. State Management
- ✅ Ported Zustand store (`features/chat/store/chatapp.store.ts`):
  - Full message state with thread organization
  - Thread management
  - Typing indicators
  - Upload progress tracking
  - Active tab and search/filter state

- ✅ Created Loader context (`store/loader/use-loader.tsx`):
  - Global loading state provider
  - Centralized loading UI control

### 5. Data Fetching
- ✅ Created Query Provider (`providers/query-provider.tsx`):
  - TanStack React Query setup
  - Configured caching and retry logic

### 6. Utilities & Helpers
- ✅ Ported utility functions (`lib/utils.ts`):
  - `cn()` - Class name merging (Tailwind)
  - `generateId()` - UUID generation
  - `deepClone()` - Object cloning
  - `retryWithBackoff()` - Retry logic

- ✅ Ported time utilities (`lib/format-time.ts`):
  - `formatTime()` - Format timestamps
  - `formatDate()` - Format dates with relative labels

- ✅ Ported debounce/throttle (`lib/debounce.ts`)

- ✅ Ported file utilities (`lib/file-utils.ts`):
  - Filename sanitization
  - MIME type detection
  - Original filename recovery

- ✅ Ported image optimization (`lib/optimize-image.ts`):
  - Browser image compression (works in React Native)
  - File size utilities

### 7. Socket.io Real-time
- ✅ Created Socket.io client (`features/chat/lib/socket-client.ts`):
  - Configured for React Native transport
  - Auto-reconnect with exponential backoff
  - Singleton pattern management
  - Proper disconnection handling

### 8. File Upload
- ✅ Created upload utilities (`features/chat/lib/upload-utils.ts`):
  - Supabase bucket upload
  - Image optimization before upload
  - Progress tracking
  - Avatar upload helper

### 9. Chat Logic
- ✅ Created filter-threads utility (`features/chat/lib/filter-threads.ts`)
- ✅ Created chat types (`features/chat/types/`)

### 10. Authentication
- ✅ Created Auth hook (`features/auth/hooks/useAuth.tsx`):
  - Supabase authentication
  - Profile fetching
  - Session management
  - Sign out functionality

### 11. Initial Socket Setup
- ✅ Created socket setup hook (`features/chat/hooks/socket/use-socket-setup.ts`)

## 🔄 In Progress / Remaining

### Hooks to Port
- [ ] `useSocketListeners.ts` - Listen for real-time events
- [ ] `useInitialLoad.ts` - Load inbox data
- [ ] `useTypingState.ts` - Manage typing indicators
- [ ] `useSendMessage.ts` - Send messages
- [ ] `useDeleteMessage.ts` - Delete messages
- [ ] `useRetryMessage.ts` - Retry failed messages
- [ ] `useChatApp.ts` - Main context hook combining all
- [ ] `use-filtered-threads.ts` - Memoized thread filtering
- [ ] `use-infinite-scroll.ts` - Pagination for messages
- [ ] `use-voice-recorder.ts` - Voice recording

### Screens to Create

#### Auth Flow
- [ ] `/app/register/_layout.tsx` - Register layout
- [ ] `/app/register/index.tsx` - Auth entry screen  
- [ ] `/app/register/onboarding` - Profile setup

#### Chat Flow
- [ ] `/app/chat/_layout.tsx` - Chat layout root
- [ ] `/app/chat/(threads)/index.tsx` - Main threads list
- [ ] `/app/chat/(threads)/[threadId]/index.tsx` - Message view
- [ ] `/app/chat/new/index.tsx` - Start messaging (search)
- [ ] `/app/chat/new/create-group.tsx` - Create group

### Message Type Components (Placeholders for Future UI Components)
- [ ] Text messages
- [ ] Image messages
- [ ] Video messages
- [ ] Voice messages
- [ ] Document messages

### Features to Implement
- [ ] Message context menu (reply, delete, copy)
- [ ] Media picker integration
- [ ] Voice recording & playback
- [ ] Typing indicators UI
- [ ] Infinite scroll / message pagination
- [ ] Search users & groups
- [ ] Create thread flow

### Animations
- [ ] Convert Framer Motion animations to react-native-reanimated v3
- [ ] Loading spinners
- [ ] Transition animations
- [ ] Gesture animations

### Root App Structure
- [ ] `/app/_layout.tsx` - Root layout with providers
- [ ] Navigation setup (Expo Router)
- [ ] Theme provider setup (if needed)

## Key Differences from Web to React Native

### 1. Navigation
- Web: Next.js App Router with `/app` routes
- React Native: Expo Router with similar structure

### 2. Styling
- Web: Tailwind CSS + Radix UI components
- React Native: NativeWind (Tailwind for React Native) + custom UI components
- **SKIP**: `/components/ui` - You will rebuild entirely with React Native components

### 3. Animations
- Web: Framer Motion
- React Native: `react-native-reanimated` v3 (more performant, recommended)
  ```typescript
  // Example: Animated box entrance
  import Animated, { FadeInUp } from 'react-native-reanimated';
  
  <Animated.View entering={FadeInUp.duration(300)}>
    <Text>Hello</Text>
  </Animated.View>
  ```

### 4. Native Capabilities
- Image Picker: `expo-image-picker`
- Audio Recording: `expo-av`
- File System: `expo-file-system`
- Storage: `@react-native-async-storage/async-storage`

### 5. API Calls
- Web: Direct `/api/` endpoints relative to origin
- React Native: Must use full URL with `EXPO_PUBLIC_API_BASE_URL`
  ```typescript
  // Usage
  import { apiClient } from '@/lib/api-client';
  
  const data = await apiClient.post('/threads/inbox', {
    limit: 20
  });
  ```

### 6. Form Handling
- Both use `react-hook-form` + `zod` ✓
- No changes needed for form logic

### 7. State Management
- Both use `zustand` ✓
- No changes needed for store

### 8. Data Fetching
- Both use `@tanstack/react-query` ✓
- Compatible across platforms

### 9. Real-time
- Both use `socket.io-client` ✓
- Transport configured for React Native

### 10. Authentication  
- Both use `@supabase/supabase-js` ✓
- Session persistence via AsyncStorage

## Environment Variables

Create or update `mobile/.env.local`:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_KEY
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# API
EXPO_PUBLIC_API_BASE_URL=https://your-api.com  # or http://localhost:3000
EXPO_PUBLIC_SOCKET_URL=https://your-socket.com # or http://localhost:3001

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
```

## Code Architecture Comparison

### Authentication Flow
```
Web: /app/register → API → Supabase → /app/chat
RN:  /register → API → Supabase → /chat with useAuth()
```

### Message Flow
```
Web: Component → useChatApp() → Zustand → Socket.io → [auto-update]
RN:  Component → useChatApp() → Zustand → Socket.io → [same]
```

### Data Fetching
```
Web: useQuery from API → /api/threads/inbox → Response
RN:  useQuery from API → buildApiUrl() → Full URL → Response
```

## Critical Files Structure

```
mobile/
├── app/                           # Routes (Expo Router)
│   ├── _layout.tsx              # Root layout
│   ├── register/                # Auth routes
│   └── chat/                    # Chat routes
├── lib/                          # Utilities
│   ├── api-client.ts            # API client
│   ├── supabase-client.ts       # Supabase setup
│   ├── socket-client.ts         # Socket.io
│   └── [utilities]
├── features/
│   ├── auth/
│   │   └── hooks/
│   │       └── useAuth.tsx      # Auth context
│   └── chat/
│       ├── store/               # Zustand store
│       ├── hooks/               # All chat hooks
│       ├── lib/                 # Chat utilities
│       └── types/               # TypeScript types
├── store/
│   └── loader/                  # Global loader
├── providers/
│   └── query-provider.tsx       # React Query
└── .env.local                   # Environment variables
```

## Next Steps

1. **Complete remaining hooks** (`use-socket-listeners.ts`, `useInitialLoad.ts`, etc.)
2. **Create auth screens** (register, onboarding)
3. **Create chat screens** (threads list, message view, search)
4. **Implement message components** (text, image, video, voice)
5. **Setup animations** with react-native-reanimated
6. **Create root navigation** structure
7. **Rebuild UI components** in `/components/ui` for React Native (you mentioned you'll do this)
8. **Test all functionality** across Android & iOS

## Important Notes

### Do NOT Use Web Patterns
- ❌ `React.FC` - Use function components with explicit return types
- ❌ `href` props - Use `asChild` or Expo Router navigation
- ❌ CSS modules - Use NativeWind/Tailwind only
- ❌ `next/image` - Use `Image` from React Native
- ❌ `next/link` - Use Expo Router `href` or `useRouter()`

### Always Check React Native Docs
- Component API differs (no `className` on native, use `style`)
- Layout is different (Flexbox-based)
- Platform-specific code needed sometimes (`Platform.select()`)
- No browser APIs (use Expo equivalents)

### Debugging
```bash
# Start expo
yarn dev

# Android
yarn android

# iOS
yarn ios

# Web (for testing)
yarn web
```

## Questions?

Refer to:
- Expo Documentation: https://docs.expo.dev
- React Native Docs: https://reactnative.dev
- Socket.io Client: https://socket.io/docs/v4/client-api/
- Supabase RN: https://supabase.com/docs/reference/javascript/
- NativeWind: https://www.nativewind.dev
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
