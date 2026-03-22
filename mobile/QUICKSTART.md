# Quick Start Guide - Mobile App

## What's Been Done

This is a partial React Native refactoring of the Next.js web chat application. The foundation is complete and ready for the final integration of business logic.

### ✅ Completed Foundation

- Mobile app structure with React Native + Expo
- Supabase authentication client for React Native
- Next.js API client with automatic token handling
- Navigation setup (Auth → Chat flow)
- Auth screens (Login, Register)
- Chat screens (List, Detail, Profile)
- Zustand chat store (ready for use)
- Complete documentation

### ⚠️ What Needs Finishing

The business logic hooks need to be copied from `/web/features/chat/hooks/` and integrated. See `REFACTOR_GUIDE.md` for detailed instructions.

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Add Your Credentials
Edit `/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Get these from:
- **Supabase URL & Key**: [Supabase Dashboard](https://app.supabase.com/)
- **API URL**: Where your Next.js web server is running

### 4. Start the App
```bash
npm start
```

Then press:
- **`i`** → iOS simulator
- **`a`** → Android emulator  
- **`w`** → Web (debugging)

## App Structure

```
mobile/
├── src/
│   ├── lib/              # Utilities (Supabase, API client)
│   ├── providers/        # Auth & Theme context
│   ├── navigation/       # Screen navigation setup
│   ├── screens/          # UI screens (Auth, Chat, Profile)
│   └── features/
│       └── chat/         # Business logic (hooks, store)
├── app.tsx              # Main entry point
└── package.json         # Dependencies
```

## Current Capabilities

### Auth
- Email/password login and registration
- Supabase session management
- Persistent sessions across app restarts

### Chat (Placeholder)
- Thread list view
- Chat detail view with message input
- Profile screen with logout
- Bottom tab navigation

### Missing (For Integration)
- Real Socket.io connection for messages
- Actual message fetching from API
- Message sending via Socket
- Typing indicators
- File uploads

## Next Steps

Follow `/mobile/REFACTOR_GUIDE.md` to:

1. Copy socket setup hooks from `/web/features/chat/hooks/socket/`
2. Copy message operation hooks
3. Copy initial load hook
4. Create main `use-chat-app.tsx` hook
5. Update screens to use real hooks
6. Test Socket.io connection
7. Implement file uploads

## Testing the Current State

### Login
```
Email: test@example.com
Password: TestPassword123
```

You should:
1. Fill in credentials
2. Click "Sign In"
3. Be redirected to Chat screen (if credentials work with your Supabase)

### Navigate
- Tap "Chats" tab → See (empty) thread list
- Tap on a thread → See (empty) message view
- Tap "Profile" tab → See user info and sign out button

## Troubleshooting

### App won't start
- Check Node.js version (16+)
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Expo cache: `expo start -c`

### Supabase auth fails
- Verify env variables are set correctly
- Check Supabase project exists and has auth enabled
- Verify API URL points to correct backend

### Can't find screens
- Ensure all files in `/mobile/src/` are created
- Check TypeScript for syntax errors
- Verify imports match file paths

## File Reference

| File | Purpose |
|------|---------|
| `app.tsx` | Main app entry with providers |
| `src/lib/supabase.ts` | Supabase client for React Native |
| `src/lib/api-client.ts` | HTTP client for Next.js routes |
| `src/providers/AuthProvider.tsx` | Session management context |
| `src/navigation/RootNavigator.tsx` | Auth/Chat routing logic |
| `src/screens/auth/LoginScreen.tsx` | Login UI |
| `src/screens/chat/ChatListScreen.tsx` | Thread list UI |
| `src/features/chat/store/chatapp.store.ts` | Zustand chat state (from web) |

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase API URL | `https://abcd.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | `eyJhbGc...` |
| `EXPO_PUBLIC_API_URL` | Next.js server URL | `http://localhost:3000` |

## Available Commands

```bash
npm start              # Start Expo dev server
npm run android        # Open Android emulator
npm run ios          # Open iOS simulator
npm run web          # Test in web browser
```

## Key Differences from Web

| Aspect | Web | Mobile |
|--------|-----|--------|
| Framework | Next.js | Expo/React Native |
| Styling | Tailwind CSS | Native styles |
| UI Lib | shadcn/ui | React Native Reusables |
| Routing | Next.js filesystem | React Navigation |
| Auth | @supabase/ssr | @supabase/supabase-js |
| Storage | localStorage | AsyncStorage |

## Architecture Diagram

```
┌─ Mobile App (React Native)
│  - Expo for iOS/Android
│  - React Navigation for routing
│  - Zustand for state
│
├─ Supabase (Auth only from mobile)
│  - Users table
│  - Auth state
│
└─ Next.js Backend (API Routes)
   ├─ /api/threads/* (fetch/create threads)
   ├─ /api/messages/* (CRUD messages)
   └─ WebSocket → Socket.io Server
      - Real-time messaging
      - Typing indicators
```

## Getting Help

1. Check `IMPLEMENTATION_SUMMARY.md` for detailed architecture
2. Read `REFACTOR_GUIDE.md` for step-by-step integration
3. Search web version for reference implementations
4. Check docs: [React Native](https://reactnative.dev), [Supabase](https://supabase.com/docs)

## Common Commands

**Update dependencies:**
```bash
npm install react-native-reusables
```

**Debug logs:**
```javascript
console.log("[v0] Debug message") // Shows in console
```

**Clear cache:**
```bash
expo start -c
```

**Test app on device:**
```bash
# Install Expo app from App Store
# Scan QR code from terminal
npm start
```

Good luck! The hardest part is done. Now just integrate the hooks. 🚀
