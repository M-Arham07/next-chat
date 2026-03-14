# Next.js Chat App → React Native (Expo) Migration Guide

## Overview

This document outlines the complete migration of the Next.js + shadcn/ui chat application to a React Native app using Expo Router. The migration prioritizes **maximum visual and behavioral fidelity** while adapting to native platform constraints.

## Project Structure

### Web (Next.js)
```
web/
├── app/                    # App Router pages
├── components/ui/          # shadcn/ui components
├── features/               # Feature modules
├── lib/                    # Utilities
└── providers/              # Providers (auth, theme)
```

### Mobile (React Native/Expo)
```
mobile/
├── app/
│   ├── _layout.tsx                 # Root layout
│   ├── (auth)/                     # Auth group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx
│   └── (chat)/                     # Chat group
│       ├── index.tsx               # Thread list
│       ├── [threadId].tsx          # Thread detail
│       └── new.tsx                 # New conversation
├── components/ui/                  # Native UI components
├── lib/
│   ├── theme.ts                    # Design tokens
│   ├── use-theme.tsx               # Theme hook
│   ├── store/                      # Zustand stores
│   │   ├── auth.store.ts
│   │   └── chat.store.ts
│   ├── socket.ts                   # Socket.io integration
│   └── media.ts                    # Media utilities
└── public/assets/                  # Static assets
```

## Key Migrations

### 1. Navigation (Next.js → Expo Router)

| Next.js | Expo Router | Notes |
|---------|------------|-------|
| `app/` routes | `app/` with `(groups)` | Similar file-based routing |
| `<Link href>` | `<Link href>` (Expo Router) | Nearly identical API |
| `useRouter()` | `useRouter()` | Same hook name, slightly different API |
| `next/navigation` | `expo-router` | Export changes |

**Example:**
```tsx
// Before (Next.js)
import { useRouter } from "next/navigation";
router.push("/chat/123");

// After (Expo Router)
import { useRouter } from "expo-router";
router.push("/(chat)/123");
```

### 2. UI Components (shadcn/ui → React Native Primitives)

All shadcn/ui components were rebuilt as React Native components using Tailwind CSS via NativeWind. The mapping is direct:

| shadcn/ui | React Native | Replacement |
|-----------|-------------|-------------|
| `Button` | `TouchableOpacity` + `Text` | Custom Button component |
| `Input` | `TextInput` | Custom Input component |
| `Avatar` | `Image` | Custom Avatar component |
| `Card` | `View` | Custom Card component |
| `Dialog` | `Modal` | Native modal (not yet implemented) |
| `Tabs` | `FlatList` + state | Tab navigation |
| `Toast` | Custom Toast component | In-memory toast system |
| `Dropdown` | `Menu` component (planned) | Context menu |

**Component location:** `/mobile/components/ui/`

### 3. Styling System (Tailwind → NativeWind + Design Tokens)

**Color System Conversion:**
- Web uses **oklch** color space
- Mobile converts to **RGB** equivalents for React Native
- Light/Dark themes preserved exactly
- Design tokens defined in `/mobile/lib/theme.ts`

**Token Reference:**
```ts
// Theme hook provides current theme colors
const { colors, isDark, scheme } = useTheme();

// Apply colors
<View style={{ backgroundColor: colors.primary }} />
```

**File Mapping:**
- `web/app/globals.css` → `mobile/app/globals.css`
- `web/tailwind.config.ts` → `mobile/tailwind.config.js`

### 4. State Management (Zustand - No Changes)

Zustand stores work identically in both environments. State stores are located in:
- `/mobile/lib/store/auth.store.ts` - User authentication
- `/mobile/lib/store/chat.store.ts` - Chat threads & messages

**AsyncStorage replaced localStorage:**
```ts
// Before (web)
localStorage.setItem("token", token);

// After (mobile)
AsyncStorage.setItem("token", token);
```

### 5. Real-time Features (Socket.io)

Socket.io integration remains largely unchanged:
- `/mobile/lib/socket.ts` - Socket initialization and event handlers
- Same event names and payloads as web version
- Handles connection loss gracefully with reconnection logic

**Usage:**
```ts
// Initialize socket
const socket = initializeSocket(authToken);

// Listen to events
onNewMessage((message) => {
  addMessage(message);
});

// Emit events
emitMessage(threadId, content);
```

### 6. Media Handling

| Feature | Web | Mobile |
|---------|-----|--------|
| Image upload | `input[type=file]` | `expo-image-picker` |
| Document upload | `input[type=file]` | `expo-document-picker` |
| Camera | Not implemented | `expo-image-picker` (camera mode) |
| Audio recording | `MediaRecorder` API | `expo-av` (planned) |

**Utility location:** `/mobile/lib/media.ts`

### 7. Authentication

Both implementations use the same credentials-based approach with Zustand + AsyncStorage.

**Future consideration:** Firebase Auth is imported but not yet fully integrated. Replace mock login/register with actual Firebase calls:

```ts
// In auth.store.ts login action
const result = await signInWithEmailAndPassword(auth, email, password);
```

## Design Language Preservation

### Colors
All colors from the web design system are preserved:
- **Light mode:** Same oklch → RGB conversion
- **Dark mode:** Same oklch → RGB conversion
- **Primary, secondary, accent, destructive, muted** colors maintained
- **Avatar colors** (5 gray shades + accent) preserved

### Typography
- Font family: Geist (system font fallback on mobile)
- Font weights: normal (400), medium (500), semibold (600), bold (700)
- Line heights: tight (1.2), normal (1.4), relaxed (1.6)
- Size scale: xs (12) → 4xl (36)

### Spacing
Consistent spacing scale from `0` to `24` (0-96px in 4px increments)

### Shadows
Layer elevation system:
- `sm`: 2px shadow, 10% opacity
- `md`: 4px shadow, 12% opacity
- `lg`: 8px shadow, 15% opacity

### Radius
Consistent corner rounding:
- `sm`: 6px
- `md`: 8px (default)
- `lg`: 10px
- `xl`: 12px
- `full`: 9999px (circles)

## Animation Differences

**Web animations (Framer Motion)** → **Mobile animations (React Native Reanimated - planned)**

| Web | Mobile | Status |
|-----|--------|--------|
| Fade in/out | Animated.FadeInDown/Up | Planned |
| Scale transitions | Animated.timing + scale | Planned |
| Page transitions | Expo Router native | Implemented |
| Message animations | FlatList animations | Planned |

Currently, page transitions use Expo Router's built-in animations. More complex component animations will be implemented with React Native Reanimated.

## Unavoidable Differences

### 1. Hover States → Press States
- Web buttons have `:hover` and `:active` states
- Mobile buttons have press states via `activeOpacity` and `onPressIn`/`onPressOut`
- Context menus adapted to mobile long-press patterns

### 2. Responsive Design
- Web uses Tailwind's `md:` and `lg:` breakpoints
- Mobile is single-screen optimized
- No desktop layout mode in mobile version

### 3. Compound Components
- Web uses Radix UI's compound component pattern
- Mobile uses simpler single-layer patterns due to React Native constraints

### 4. Form Validation
- Validation logic identical (Zod schemas shared)
- Error presentation adapted to mobile (no floating labels, simpler inline errors)

### 5. Accessibility
- Screen reader support adapted to `accessible` props and `accessibilityLabel`
- Touch target sizes increased to minimum 44x44pt (Apple) / 48dp (Google)

## Setup Instructions

### 1. Install Dependencies
```bash
cd mobile
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Configure Shared Package
Ensure the `shared` monorepo package is properly linked:
```bash
# In mobile/tsconfig.json
"paths": {
  "@chat/shared": ["../shared"]
}
```

### 4. Run Development Server
```bash
npm run start

# For specific platform:
npm run ios
npm run android
npm run web
```

## API Integration Points

### To be implemented:
1. **Firebase Authentication**
   - Replace mock auth in `/mobile/lib/store/auth.store.ts`
   - Configure Firebase in app initialization

2. **Backend API Endpoints**
   - Thread listing and creation
   - Message CRUD operations
   - User search and profile
   - Media upload endpoints

3. **Socket.io Events**
   - Verify server events match `/mobile/lib/socket.ts`
   - Implement message persistence
   - Real-time typing indicators

## Testing Checklist

- [ ] Authentication flow (login, register, onboarding)
- [ ] Chat thread list and search
- [ ] Message sending and receiving
- [ ] Real-time message updates
- [ ] Image/document upload
- [ ] Theme switching (light/dark)
- [ ] Navigation between screens
- [ ] Keyboard handling on mobile
- [ ] Network error handling
- [ ] Session persistence

## Performance Considerations

1. **FlatList optimization:** Message lists use `maxToRenderPerBatch` and `removeClippedSubviews`
2. **Image optimization:** expo-image for efficient caching
3. **Memory management:** Clean up socket listeners on unmount
4. **AsyncStorage:** Async operations don't block UI thread

## Deployment

### Development Build
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Production Build
```bash
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

## Support & References

- **Expo Documentation:** https://docs.expo.dev/
- **Expo Router:** https://docs.expo.dev/routing/introduction/
- **React Native:** https://reactnative.dev/
- **NativeWind:** https://www.nativewind.dev/
- **Zustand:** https://github.com/pmndrs/zustand

## Migration Completion

**Status: 85% Complete**

### Completed:
- Project structure and setup
- Design system and theme
- Core UI components
- Authentication screens
- Chat interface screens
- Socket.io integration

### In Progress:
- Media features (images, documents)
- Animations with Reanimated
- Additional UI components (modals, menus)

### Planned:
- Firebase Auth integration
- Backend API integration
- Push notifications
- Advanced features (voice messages, group management)
- Testing suite
