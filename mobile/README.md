# Next Chat - React Native (Expo)

A fully-functional React Native chat application built with Expo Router, featuring real-time messaging, group conversations, and media sharing capabilities. This is a faithful port of the Next.js web version, optimized for iOS and Android with maximum visual fidelity to the original design.

## Features

- **Authentication**
  - Email/password login and registration
  - Profile onboarding
  - Persistent session management with AsyncStorage
  - Firebase Auth ready (mock auth by default)

- **Messaging**
  - One-on-one direct messages
  - Group conversations
  - Real-time message sync via Socket.io
  - Message history and search
  - Unread message badges

- **Media Sharing**
  - Image picking and upload
  - Document attachment
  - Camera integration
  - Audio recording (planned)

- **UI/UX**
  - Light and dark theme support
  - Native design language adapted from web
  - Smooth animations and transitions
  - Responsive layout optimized for mobile
  - Gesture-based navigation

## Tech Stack

### Core
- **Framework:** Expo 52
- **Navigation:** Expo Router 3
- **React Version:** 18.3
- **State Management:** Zustand
- **Form Validation:** React Hook Form + Zod
- **Styling:** NativeWind + Design Tokens

### Backend Integration
- **Real-time:** Socket.io
- **Authentication:** Firebase Auth (optional)
- **Database:** Backend API (to be configured)

### UI & Icons
- **Icons:** lucide-react-native
- **Media:** expo-image-picker, expo-document-picker, expo-av
- **System:** expo-linking, expo-screen-orientation

## Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx                 # Root layout
│   ├── index.tsx                   # Entry point
│   ├── (auth)/                     # Auth screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx
│   └── (chat)/                     # Chat screens
│       ├── _layout.tsx
│       ├── index.tsx               # Thread list
│       ├── [threadId].tsx          # Thread detail
│       └── new.tsx                 # New conversation
│
├── components/ui/                  # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── avatar.tsx
│   ├── card.tsx
│   ├── spinner.tsx
│   ├── toast.tsx
│   └── separator.tsx
│
├── lib/
│   ├── theme.ts                    # Design tokens (colors, spacing, etc.)
│   ├── use-theme.tsx               # Theme hook
│   ├── socket.ts                   # Socket.io integration
│   ├── media.ts                    # Media utilities
│   ├── store/
│   │   ├── auth.store.ts           # Auth state (Zustand)
│   │   └── chat.store.ts           # Chat state (Zustand)
│   └── utils/                      # Helper functions
│
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build configuration
├── tailwind.config.js              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies

```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your configuration
# EXPO_PUBLIC_SOCKET_URL - Your Socket.io server
# EXPO_PUBLIC_FIREBASE_* - Firebase config (optional)
```

### 3. Link Shared Package

The mobile app shares types and utilities from the monorepo's `shared` package. This is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@chat/shared": ["../shared"]
    }
  }
}
```

### 4. Run Development Server

```bash
# Start Expo dev server
npm run start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run web version (experimental)
npm run web
```

## Development Workflow

### Creating New Screens

All screens use Expo Router's file-based routing. Add `.tsx` files to `app/` directory:

```tsx
// app/(chat)/new-feature.tsx
import { View, Text } from "react-native"
import { useRouter } from "expo-router"

export default function NewFeatureScreen() {
  const router = useRouter()
  
  return (
    <View>
      <Text>New Feature</Text>
    </View>
  )
}
```

### Using Theme

Import and use the theme hook in any component:

```tsx
import { useTheme } from "@/lib/use-theme"

export function MyComponent() {
  const { colors, isDark } = useTheme()
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Hello</Text>
    </View>
  )
}
```

### Managing State

Use Zustand stores for global state:

```tsx
import { useAuthStore } from "@/lib/store/auth.store"
import { useChatStore } from "@/lib/store/chat.store"

export function MyScreen() {
  const { user, login } = useAuthStore()
  const { threads, addMessage } = useChatStore()
  
  // Use state...
}
```

### Socket.io Integration

Initialize socket connection in chat layout:

```tsx
import { useEffect } from "react"
import { initializeSocket, onNewMessage } from "@/lib/socket"
import { useAuthStore } from "@/lib/store/auth.store"

export function ChatLayout() {
  const { token } = useAuthStore()
  
  useEffect(() => {
    if (token) {
      const socket = initializeSocket(token)
      onNewMessage((message) => {
        // Handle new message
      })
    }
  }, [token])
}
```

## Component Library

### Button

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="md" onPress={handlePress}>
  Click me
</Button>
```

**Variants:** `default` | `outline` | `ghost` | `destructive`
**Sizes:** `sm` | `md` | `lg`

### Input

```tsx
import { Input } from "@/components/ui/input"

<Input
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
/>
```

### Avatar

```tsx
import { Avatar } from "@/components/ui/avatar"

<Avatar initials="JD" size="lg" colorIndex={0} />
```

**Sizes:** `sm` | `md` | `lg` | `xl`

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Design System

### Colors

The design system preserves the exact colors from the web version, converted from oklch to RGB:

```ts
import { useTheme } from "@/lib/use-theme"

const { colors } = useTheme()

// Light mode
colors.background     // rgb(248 248 252)
colors.foreground     // rgb(15 23 42)
colors.primary        // rgb(30 30 30)
colors.secondary      // rgb(235 235 240)
colors.muted          // rgb(226 232 240)
colors.destructive    // rgb(239 68 68)

// Also available: card, border, input, ring, accent, success, etc.
```

### Spacing Scale

Consistent spacing in 4px increments:

```ts
import { SPACING } from "@/lib/theme"

SPACING[0]   // 0px
SPACING[1]   // 4px
SPACING[4]   // 16px
SPACING[8]   // 32px
```

### Border Radius

```ts
import { RADIUS } from "@/lib/theme"

RADIUS.sm    // 6px
RADIUS.md    // 8px
RADIUS.lg    // 10px
RADIUS.full  // 9999px (circles)
```

### Shadows

```ts
import { SHADOWS } from "@/lib/theme"

<View style={SHADOWS.md}>
  {/* Elevated content */}
</View>
```

## API Integration

### Backend Configuration

To connect to your backend API:

1. **Update Socket.io URL:**
   ```bash
   EXPO_PUBLIC_SOCKET_URL=https://your-api.com/socket.io
   ```

2. **Replace Mock Auth:**
   In `/lib/store/auth.store.ts`, replace the mock login/register with actual API calls.

3. **Implement API Client:**
   Create `/lib/api.ts` with endpoint definitions:
   ```ts
   const API_URL = process.env.EXPO_PUBLIC_API_URL
   
   export async function getThreads() {
     const response = await fetch(`${API_URL}/threads`)
     return response.json()
   }
   ```

### Firebase Setup (Optional)

To enable Firebase Authentication:

1. Install Firebase:
   ```bash
   npm install firebase react-native-firebase
   ```

2. Initialize in auth store:
   ```ts
   import { initializeApp } from "firebase/app"
   import { getAuth } from "firebase/auth"
   
   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
     // ...
   }
   
   const app = initializeApp(firebaseConfig)
   export const auth = getAuth(app)
   ```

## Testing Checklist

- [ ] **Auth Flow**
  - [ ] Login with email/password
  - [ ] Register new account
  - [ ] Profile onboarding
  - [ ] Persistent session (restart app)
  - [ ] Logout

- [ ] **Chat Features**
  - [ ] Load thread list
  - [ ] Search conversations
  - [ ] Open thread and load messages
  - [ ] Send text message
  - [ ] Receive message (real-time)
  - [ ] Create new DM
  - [ ] Create group chat

- [ ] **Media**
  - [ ] Pick image from gallery
  - [ ] Take photo with camera
  - [ ] Pick document
  - [ ] Upload and display media

- [ ] **UI/UX**
  - [ ] Theme toggle (light/dark)
  - [ ] Navigation animations
  - [ ] Keyboard handling
  - [ ] Safe area insets
  - [ ] Touch targets (>44x44pt)

- [ ] **Performance**
  - [ ] Smooth scrolling in message lists
  - [ ] No memory leaks on screen transitions
  - [ ] Fast image loading

## Building for Production

### iOS

```bash
# Development build
eas build --platform ios --profile preview

# Production build
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Development build (APK)
eas build --platform android --profile preview

# Production build (AAB)
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## Troubleshooting

### Common Issues

**Socket.io connection fails**
- Check `EXPO_PUBLIC_SOCKET_URL` is correct
- Verify backend is running and accessible
- Check network permissions in app config

**Theme not applying**
- Ensure `useTheme()` hook is used in component
- Check component is inside root layout
- Clear Expo cache: `expo r -c`

**Images not loading**
- Verify image URI is correct format: `{ uri: "http://..." }`
- Check Android network permissions in `app.json`
- Ensure images are HTTPS on iOS (unless configured otherwise)

**Navigation not working**
- Check route paths match file structure
- Use `(groups)` syntax for grouped routes
- Verify `_layout.tsx` files export default function

**Keyboard issues**
- Wrap inputs in `KeyboardAvoidingView`
- Use `keyboardShouldPersistTaps="handled"` on ScrollView
- Test on actual device (simulator behavior differs)

### Debug Commands

```bash
# Clear cache and restart
expo r -c

# View logs
expo logs

# Test specific platform
expo prebuild --clean
expo run:ios
```

## Performance Optimization

### FlatList Best Practices
```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  scrollEventThrottle={16}
/>
```

### Memory Management
- Cleanup subscriptions in useEffect returns
- Use `useCallback` for expensive computations
- Lazy load images with `expo-image`

### Network Optimization
- Implement request caching
- Use socket.io rooms for efficient broadcasting
- Paginate message lists

## Contributing

To add new features:

1. Create feature branch: `git checkout -b feature/new-feature`
2. Follow component patterns in `/components/ui/`
3. Use theme tokens for all colors/spacing
4. Update documentation
5. Test on both iOS and Android
6. Submit PR with description

## Resources

- **Expo Docs:** https://docs.expo.dev/
- **Expo Router:** https://docs.expo.dev/routing/introduction/
- **React Native:** https://reactnative.dev/
- **NativeWind:** https://www.nativewind.dev/
- **Zustand:** https://github.com/pmndrs/zustand
- **Socket.io:** https://socket.io/docs/v4/

## Migration from Web

This project is a complete port of the Next.js web application. See `../MIGRATION_GUIDE.md` for detailed information about:
- Component conversions
- Design system mapping
- State management changes
- Navigation patterns
- API integration points

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the migration guide for similar issues
3. Open an issue on GitHub with:
   - Device/OS version
   - Steps to reproduce
   - Error logs (from `expo logs`)
   - Screenshots if applicable
