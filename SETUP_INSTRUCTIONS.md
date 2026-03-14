# Setup Instructions - Next.js Chat App to Expo Router Migration

## Quick Start (No Sandbox Required)

### Option 1: Clone from GitHub (Recommended)

```bash
# Clone the repository with the migration branch
git clone -b nextjs-to-expo-migration https://github.com/M-Arham07/next-chat.git
cd next-chat

# Install dependencies
pnpm install

# Navigate to mobile directory
cd mobile

# Start the Expo development server
npx expo start

# Press 'i' for iOS or 'a' for Android
```

### Option 2: Download Pre-packaged ZIP

The complete migration is available in the `/mobile` directory within the repo. Download the entire project and extract it locally.

---

## Local Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Expo CLI** (`npm install -g eas-cli`)
- **iOS Simulator** or **Android Emulator** (or physical device)

### Installation

```bash
# 1. Clone and navigate
git clone -b nextjs-to-expo-migration https://github.com/M-Arham07/next-chat.git
cd next-chat

# 2. Install monorepo dependencies
pnpm install

# 3. Setup environment variables
cd mobile
cp .env.example .env.local

# Edit .env.local with your configuration:
# - API_URL: Your backend server URL
# - SOCKET_URL: Your WebSocket/Socket.io server URL
# - FIREBASE_CONFIG: Firebase credentials (if using auth)
```

### Running the App

```bash
# From the mobile directory
pnpm start

# Options:
# - Press 'i' to open iOS Simulator
# - Press 'a' to open Android Emulator
# - Scan QR code with Expo Go app (physical device)
```

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

---

## Project Structure

```
next-chat/
├── mobile/                    # Expo Router React Native app (NEW)
│   ├── app/                   # Expo Router routes
│   │   ├── (auth)/            # Authentication screens
│   │   ├── (chat)/            # Chat screens
│   │   └── _layout.tsx        # Root layout
│   ├── components/ui/         # Native UI components
│   ├── lib/                   # Utilities & stores
│   ├── package.json           # Mobile-specific dependencies
│   └── README.md              # Mobile setup guide
├── web/                       # Original Next.js app
├── shared/                    # Shared types & utilities
├── realtime/                  # Real-time server
├── pnpm-workspace.yaml        # Workspace config
└── MIGRATION_*.md             # Migration documentation
```

---

## Configuration

### Environment Variables (.env.local)

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://your-api-server.com
EXPO_PUBLIC_SOCKET_URL=http://your-socket-server.com

# Firebase (optional)
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Feature Flags
EXPO_PUBLIC_ENABLE_VOICE_MESSAGES=true
EXPO_PUBLIC_ENABLE_IMAGE_SHARING=true
```

### Theme Configuration

The app uses a design token system that preserves your web design. Customize colors in `mobile/lib/theme.ts`.

---

## Common Tasks

### Adding a New Screen

```typescript
// 1. Create file: app/(chat)/new-screen.tsx
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useThemedStyles } from '@/lib/use-theme';

export default function NewScreen() {
  const styles = useThemedStyles();
  
  return (
    <View style={styles.container}>
      <Text>New Screen</Text>
    </View>
  );
}

// 2. Navigate using:
const router = useRouter();
router.push('/new-screen');
```

### Adding a New Component

```typescript
// 1. Create: components/ui/custom-component.tsx
import { View, Text } from 'react-native';
import { useThemedStyles } from '@/lib/use-theme';

interface CustomComponentProps {
  title: string;
}

export function CustomComponent({ title }: CustomComponentProps) {
  const styles = useThemedStyles();
  
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

// 2. Use in screens:
import { CustomComponent } from '@/components/ui/custom-component';
```

### Styling with NativeWind

```typescript
import { Text } from 'react-native';
import { useTheme } from '@/lib/use-theme';

export function StyledText() {
  const { colors } = useTheme();
  
  return (
    <Text className="text-xl font-bold" 
          style={{ color: colors.foreground }}>
      Styled with NativeWind
    </Text>
  );
}
```

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Metro bundler errors

**Solution:**
```bash
# Reset Expo cache
npx expo start --clear

# Or use:
expo start -c
```

### Issue: Simulator not opening

**Solution:**
```bash
# For iOS:
xcrun simctl erase all  # Reset all simulators
npx expo start          # Then press 'i'

# For Android:
# Ensure Android emulator is running before starting expo
```

### Issue: Build fails with "ENOENT"

**Solution:**
```bash
# Ensure all packages are installed
pnpm install -r  # Install all workspaces

# Then try building again
cd mobile && pnpm start
```

---

## Backend Integration

The mobile app connects to your existing backend services:

- **REST API:** Use the API_URL environment variable
- **WebSocket:** Configure SOCKET_URL for real-time sync
- **Authentication:** Update auth logic in `lib/store/auth.store.ts`

See `COMPONENT_MIGRATION.md` for API integration examples.

---

## Performance Optimization

1. **Image Loading:** Use `expo-image` with caching
2. **List Rendering:** Use FlatList with `removeClippedSubviews`
3. **State Updates:** Use Zustand for optimized re-renders
4. **Code Splitting:** Expo Router handles this automatically

---

## Documentation

Read these in order:

1. `README_MIGRATION.md` - Executive summary
2. `MIGRATION_INDEX.md` - Navigation guide
3. `MIGRATION_SUMMARY.md` - Complete status
4. `MIGRATION_GUIDE.md` - Technical decisions
5. `COMPONENT_MIGRATION.md` - Code reference
6. `mobile/TECHNICAL_CHECKLIST.md` - Implementation tracking

---

## Support & Resources

- **Expo Documentation:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **NativeWind:** https://www.nativewind.dev
- **Expo Router:** https://docs.expo.dev/routing/introduction

---

## Next Steps

1. ✓ Clone the repository
2. ✓ Install dependencies (`pnpm install`)
3. ✓ Configure environment variables
4. ✓ Start the development server (`pnpm start`)
5. ✓ Connect your backend services
6. ✓ Build and deploy

Happy building!
