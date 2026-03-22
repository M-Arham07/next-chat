# Implementation Checklist

Use this checklist to track progress completing the React Native refactoring.

## Phase 1: Foundation (✅ COMPLETE)

- [x] Mobile project structure
- [x] package.json with all dependencies (npm only)
- [x] Expo configuration (app.json)
- [x] TypeScript setup
- [x] Supabase React Native client
- [x] API client for Next.js routes
- [x] Auth Provider with context
- [x] Theme Provider
- [x] React Navigation setup
- [x] Environment file template
- [x] Main app entry (app.tsx)

## Phase 2: Business Logic Hooks (⚠️ IN PROGRESS)

### Socket Integration
- [ ] Copy `/web/features/chat/hooks/socket/use-socket-setup.ts`
  - [ ] Update imports (remove Next.js specifics)
  - [ ] Test socket connection initialization
  - [ ] Verify Supabase token injection

- [ ] Copy `/web/features/chat/hooks/socket/use-socket-listeners.tsx`
  - [ ] Update imports
  - [ ] Verify event listeners
  - [ ] Test message:new event
  - [ ] Test message:delete event
  - [ ] Test typing events

### Initial Load
- [ ] Copy `/web/features/chat/hooks/initial-load/use-initial-load.ts`
  - [ ] Update imports (use apiClient)
  - [ ] Replace fetch with apiClient.get()
  - [ ] Verify thread loading
  - [ ] Verify message loading

### Typing State
- [ ] Copy `/web/features/chat/hooks/typing/use-typing-state.ts`
  - [ ] Verify socket emit calls
  - [ ] Test typing debounce (800ms)

### Message Operations
- [ ] Copy `/web/features/chat/hooks/message-operations/use-send-message.ts`
  - [ ] Update imports
  - [ ] Replace toast with Alert
  - [ ] Remove Next.js specific code
  - [ ] Test message creation
  - [ ] Test file upload (when ready)
  - [ ] Test progress tracking

- [ ] Copy `/web/features/chat/hooks/message-operations/use-delete-message.ts`
  - [ ] Update imports
  - [ ] Replace toast with Alert
  - [ ] Test message deletion

- [ ] Copy `/web/features/chat/hooks/message-operations/use-retry-message.ts`
  - [ ] No changes needed (framework agnostic)

- [ ] Copy `/web/features/chat/hooks/message-operations/handle-receive-message.ts`
  - [ ] No changes needed (framework agnostic)

### Utilities
- [ ] Copy `/web/features/chat/hooks/utils/use-filtered-threads.ts`
  - [ ] No changes needed (framework agnostic)

### Main Chat Hook
- [ ] Create `/mobile/src/features/chat/hooks/use-chat-app.tsx`
  - [ ] Combine all hooks from above
  - [ ] Create ChatAppContext
  - [ ] Create ChatAppProvider component
  - [ ] Export useChatApp() hook
  - [ ] Match web version interface

## Phase 3: Library Utilities (⚠️ IN PROGRESS)

### Socket Client
- [ ] Copy `/web/features/chat/lib/socket-client.ts` to `/mobile/src/features/chat/lib/`
  - [ ] Verify Socket.io version compatibility
  - [ ] Test connection with JWT token
  - [ ] Test event emission and listening

### File Utilities
- [ ] Copy `/web/features/chat/lib/file-utils.ts` (if exists)
  - [ ] Adapt for React Native file handling
  - [ ] Test blob URL creation/revocation

### Upload Utilities  
- [ ] Copy `/web/features/chat/lib/upload-utils.ts` (if exists)
  - [ ] Verify Supabase storage compatibility
  - [ ] Test file upload with progress

## Phase 4: UI Components (✅ PARTIALLY COMPLETE)

### Auth Screens
- [x] LoginScreen.tsx - Basic email/password
  - [ ] Add OAuth buttons (Google, GitHub, Apple)
  - [ ] Style with React Native Reusables
  - [ ] Add error messages
  - [ ] Add loading states

- [x] RegisterScreen.tsx - Basic registration
  - [ ] Add email validation
  - [ ] Add password strength indicator
  - [ ] Style with React Native Reusables

### Chat Screens
- [x] ChatListScreen.tsx - Thread list
  - [ ] Wire up useChatApp hook
  - [ ] Load real threads from store
  - [ ] Implement search/filter
  - [ ] Style with React Native Reusables
  - [ ] Add pull-to-refresh

- [x] ChatDetailScreen.tsx - Messages
  - [ ] Wire up useChatApp hook
  - [ ] Load real messages for thread
  - [ ] Implement handleSendMessage
  - [ ] Show typing indicators
  - [ ] Add message reactions
  - [ ] Style with React Native Reusables

### Profile Screen
- [x] ProfileScreen.tsx - User profile
  - [ ] Load real user data
  - [ ] Add edit profile
  - [ ] Style with React Native Reusables

### Navigation
- [x] RootNavigator.tsx
- [x] AuthNavigator.tsx
- [x] ChatNavigator.tsx
- [ ] Test all navigation flows

## Phase 5: React Native Reusables (⏳ NOT STARTED)

- [ ] Run: `npx @react-native-reusables/cli@latest init`
- [ ] Replace native components:
  - [ ] Button component
  - [ ] TextInput component
  - [ ] Dialog/Modal component
  - [ ] Tabs component
  - [ ] Other components as needed
- [ ] Update all screens to use generated components
- [ ] Test component styling
- [ ] Verify accessibility

## Phase 6: Real-time Features (⏳ NOT STARTED)

### Socket.io Connection
- [ ] Test socket initialization
- [ ] Verify JWT token injection
- [ ] Test connection success/failure handling
- [ ] Implement reconnection logic
- [ ] Handle connection lost scenarios

### Message Events
- [ ] Test message:new emission
- [ ] Test message:delete emission
- [ ] Test message receiving
- [ ] Test message deletion
- [ ] Test error handling

### Typing Indicators
- [ ] Test typing:start emission
- [ ] Test typing:stop emission
- [ ] Test receiving typing indicators
- [ ] Test UI updates

### Presence
- [ ] Test user online/offline status (if applicable)
- [ ] Show active users in thread

## Phase 7: File Uploads (⏳ NOT STARTED)

### Image Uploads
- [ ] Setup expo-image-picker
- [ ] Create image selection UI
- [ ] Test image compression
- [ ] Test upload to Supabase storage
- [ ] Show upload progress
- [ ] Display uploaded images

### Video Uploads
- [ ] Setup video picker
- [ ] Test video upload (note: browser limit is 5MB)
- [ ] Handle large video rejection
- [ ] Show upload progress

### Document Uploads
- [ ] Setup expo-document-picker
- [ ] Test document upload
- [ ] Verify file type restrictions
- [ ] Show upload progress

## Phase 8: Performance & Polish (⏳ NOT STARTED)

### Performance
- [ ] Profile app with React Native Debugger
- [ ] Optimize re-renders (useMemo, useCallback)
- [ ] Implement message pagination
- [ ] Test with large thread lists
- [ ] Memory leak detection

### Error Handling
- [ ] Network error handling
- [ ] Auth error handling
- [ ] File upload errors
- [ ] Socket.io connection errors
- [ ] Graceful degradation

### UX Polish
- [ ] Loading skeletons
- [ ] Empty state screens
- [ ] Error state screens
- [ ] Keyboard handling
- [ ] Scroll behavior
- [ ] Focus management

### Testing
- [ ] Manual flow testing
- [ ] Edge case testing
- [ ] Error scenario testing
- [ ] Device testing (various screen sizes)

## Phase 9: Deployment (⏳ NOT STARTED)

### Build
- [ ] Test production build
- [ ] Verify environment variables
- [ ] Test APK build (Android)
- [ ] Test IPA build (iOS)

### Testing
- [ ] TestFlight testing (iOS)
- [ ] Firebase testing (Android)
- [ ] Real device testing
- [ ] Different OS versions

### Release
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Release notes
- [ ] Update documentation

## Verification Checklist

Complete these checks before considering the refactoring done:

### Functionality
- [ ] App launches without crashes
- [ ] Login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Can register new account
- [ ] After login, chat screen appears
- [ ] Chat threads appear (with real data)
- [ ] Can click thread to see detail
- [ ] Can type message
- [ ] Can send message
- [ ] Message appears in real-time
- [ ] Can delete message
- [ ] Typing indicators appear/disappear
- [ ] Can upload files
- [ ] Can logout
- [ ] After logout, back at login screen

### Persistence
- [ ] Session saved after login
- [ ] App restart maintains session
- [ ] Messages persist across app restart
- [ ] Typing state resets on app restart

### Error Handling
- [ ] Network errors show appropriate message
- [ ] Auth errors show appropriate message
- [ ] File upload errors show message
- [ ] Invalid file types are rejected
- [ ] File size limits are enforced

### Performance
- [ ] App starts in < 3 seconds
- [ ] Messages load in < 1 second
- [ ] No noticeable lag when typing
- [ ] Scrolling is smooth
- [ ] No memory leaks after extended use

### Compatibility
- [ ] Works on iOS 14+
- [ ] Works on Android 8+
- [ ] Works on various screen sizes
- [ ] Works with and without internet
- [ ] Handles all edge cases gracefully

## Time Estimates

| Phase | Tasks | Est. Hours | Status |
|-------|-------|-----------|--------|
| 1 | Foundation | 4 | ✅ Done |
| 2 | Business Logic | 3 | ⚠️ In Progress |
| 3 | Utilities | 1 | ⏳ Pending |
| 4 | UI Components | 4 | ⚠️ In Progress |
| 5 | React Native Reusables | 2 | ⏳ Pending |
| 6 | Real-time Features | 3 | ⏳ Pending |
| 7 | File Uploads | 3 | ⏳ Pending |
| 8 | Polish & Optimize | 3 | ⏳ Pending |
| 9 | Deployment | 2 | ⏳ Pending |

**Total: 25 hours** (4 already done, ~21 remaining)

## Priority Order

Complete in this order for best results:

1. Phase 2 - Business Logic hooks (most important)
2. Phase 4 - Wire up UI with real hooks
3. Phase 6 - Real-time features
4. Phase 5 - React Native Reusables (polish)
5. Phase 7 - File uploads
6. Phase 3 - Utilities (if not included in 2)
7. Phase 8 - Performance & polish
8. Phase 9 - Deployment (final stage)

## Getting Help

- Architecture questions → `IMPLEMENTATION_SUMMARY.md`
- Setup issues → `QUICKSTART.md`
- Integration steps → `REFACTOR_GUIDE.md`
- Code examples → `/web` directory

## Tracking Progress

Update this checklist as you complete items. Commit changes with:
```bash
git add mobile/
git commit -m "Complete [Phase N]: [Feature Name]"
```

## Notes

- Keep business logic changes minimal
- Test after each phase
- Use debug logs: `console.log("[v0] ...")`
- Reference web version for implementation
- Ask questions in comments/docs

---

Last Updated: March 22, 2026
Estimated Completion: 4 weeks (with 5-10 hrs/week work)
