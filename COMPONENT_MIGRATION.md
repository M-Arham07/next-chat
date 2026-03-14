# Component Migration Reference

## UI Components Mapping

### 1. Button Component

**Web (shadcn/ui):**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg" disabled={false}>
  Click me
</Button>
```

**Mobile (React Native):**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg" disabled={false} onPress={handlePress}>
  Click me
</Button>
```

**Variants:** `default` | `outline` | `ghost` | `destructive`
**Sizes:** `sm` | `md` | `lg`
**Props:** `onPress` | `disabled` | `loading` | `variant` | `size`

**Migration Notes:**
- `onClick` → `onPress`
- Added `loading` state with spinner
- `activeOpacity` set to 0.7 for press feedback

---

### 2. Input Component

**Web:**
```tsx
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Email" />
```

**Mobile:**
```tsx
import { Input } from "@/components/ui/input"

<Input 
  label="Email"
  placeholder="Email"
  value={value}
  onChangeText={onChange}
  error={errors.email?.message}
/>
```

**Props:** `placeholder` | `value` | `onChangeText` | `error` | `label` | `multiline` | `secureTextEntry`

**Migration Notes:**
- Uses controlled component pattern (value + onChangeText)
- Built-in error display below input
- Optional label prop
- `type` prop replaced with specific flags (secureTextEntry for password)

---

### 3. Avatar Component

**Web:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src={src} alt={alt} />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

**Mobile:**
```tsx
import { Avatar } from "@/components/ui/avatar"

<Avatar 
  source={{uri: imageUrl}}
  initials="AB"
  size="md"
  colorIndex={0}
/>
```

**Sizes:** `sm` (32) | `md` (40) | `lg` (48) | `xl` (56)
**Props:** `source` | `initials` | `size` | `colorIndex`

**Migration Notes:**
- Compound components merged into single Avatar component
- Image source uses `{ uri: string }` format
- Built-in avatar colors based on colorIndex (5 gray shades)
- Automatically rounds to circle

---

### 4. Card Component

**Web:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Mobile:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Exported Components:** `Card` | `CardHeader` | `CardTitle` | `CardDescription` | `CardContent` | `CardFooter`

**Migration Notes:**
- Compound component pattern preserved
- Border and background colors from theme
- Padding and margins adapted for mobile

---

### 5. Spinner Component

**Web:**
```tsx
import { Loader2 } from "lucide-react"

<Loader2 className="animate-spin" />
```

**Mobile:**
```tsx
import { Spinner } from "@/components/ui/spinner"

<Spinner size="large" />
```

**Sizes:** `small` | `large`
**Props:** `size` | `style`

**Migration Notes:**
- Uses `ActivityIndicator` under the hood
- Animated automatically (no manual animation needed)

---

### 6. Toast Component

**Web (Sonner):**
```tsx
import { toast } from "sonner"

toast.success("Message sent!")
```

**Mobile:**
```tsx
import { useToast } from "@/components/ui/toast"

const { toast } = useToast()
toast("Message sent!", "success")
```

**Toast Types:** `success` | `error` | `info`
**Usage:** `toast(message, variant)` or `toast(message)`

**Migration Notes:**
- Manual toast state management (not integrated with hooks yet)
- Toast container must be added to screen root
- Auto-dismisses after 3 seconds

---

### 7. Separator Component

**Web:**
```tsx
import { Separator } from "@/components/ui/separator"

<Separator />
```

**Mobile:**
```tsx
import { Separator } from "@/components/ui/separator"

<Separator horizontal={true} />
```

**Props:** `horizontal` | `style`

**Migration Notes:**
- Added `horizontal` prop to control direction
- Default is horizontal (1px line)
- Vertical separator used in lists (1px width)

---

## Screen/Page Migrations

### 1. Login Screen

**Web:** `/web/app/register/page.tsx`
**Mobile:** `/mobile/app/(auth)/login.tsx`

**Key Features:**
- Email and password fields
- Show/hide password toggle
- Error message display
- Loading state on submit button
- Link to register and forgot password screens

**Differences:**
- Web: Framer Motion animations, glassmorphism background
- Mobile: Simple layout optimized for small screens, no background effects

---

### 2. Register Screen

**Web:** `/web/app/register/page.tsx`
**Mobile:** `/mobile/app/(auth)/register.tsx`

**Key Features:**
- Email, username, password, confirm password fields
- Password strength indicator (planned)
- Loading state
- Link to login screen

**Differences:**
- Web: Multi-step form with animations
- Mobile: Linear form optimized for mobile

---

### 3. Chat Threads List

**Web:** `/web/app/chat/(threads)/page.tsx`
**Mobile:** `/mobile/app/(chat)/index.tsx`

**Key Features:**
- List of conversation threads
- Search/filter conversations
- Unread message badge
- Last message preview
- Floating action button for new chat
- Pull-to-refresh (planned)

**Differences:**
- Web: Sidebar layout with desktop/mobile variants
- Mobile: Full-screen FlatList with search bar

---

### 4. Chat Thread Detail

**Web:** `/web/app/chat/(threads)/[threadId]/page.tsx`
**Mobile:** `/mobile/app/(chat)/[threadId].tsx`

**Key Features:**
- Message list (scrollable, inverted for chat)
- Message bubbles with sender info
- Text input with send button
- Media attachment button
- Thread header with member info
- Typing indicators (planned)

**Differences:**
- Web: Message bubbles with animations, hover menus
- Mobile: Simplified bubbles, long-press menus (planned)

---

### 5. New Conversation

**Web:** `/web/app/chat/new/page.tsx`
**Mobile:** `/mobile/app/(chat)/new.tsx`

**Key Features:**
- User search with FlatList
- Multi-select user chips
- Create DM or group chat
- Selected users display at top

**Differences:**
- Web: Complex modal with animations
- Mobile: Full-screen navigation with simpler UX

---

## Theme and Styling

### Design Token System

**File:** `/mobile/lib/theme.ts`

**Color tokens available:**
- `background` / `foreground`
- `card` / `card-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `success` / `success-foreground`
- `border` | `input` | `ring`

**Exported from theme.ts:**
```ts
export const COLORS = { light: {...}, dark: {...} }
export const TYPOGRAPHY = { fonts: {...}, sizes: {...}, weights: {...} }
export const SPACING = { 0: 0, 1: 4, 2: 8, ... }
export const RADIUS = { sm: 6, md: 8, lg: 10, ... }
export const SHADOWS = { sm: {...}, md: {...}, lg: {...} }
```

**Usage with hook:**
```tsx
import { useTheme } from "@/lib/use-theme"

export function MyComponent() {
  const { colors, isDark, scheme } = useTheme()
  
  return (
    <View style={{ backgroundColor: colors.primary }}>
      <Text style={{ color: colors.primaryForeground }}>Hello</Text>
    </View>
  )
}
```

---

## State Management

### Auth Store

**File:** `/mobile/lib/store/auth.store.ts`

**Store shape:**
```ts
{
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  login(email, password): Promise<void>
  register(email, password, username): Promise<void>
  logout(): Promise<void>
  restoreSession(): Promise<void>
  setUser(user): void
  setToken(token): void
}
```

**Usage:**
```tsx
import { useAuthStore } from "@/lib/store/auth.store"

export function LoginScreen() {
  const { login, isLoading, user } = useAuthStore()
  
  const handleLogin = async () => {
    await login(email, password)
  }
}
```

### Chat Store

**File:** `/mobile/lib/store/chat.store.ts`

**Store shape:**
```ts
{
  threads: Thread[]
  currentThread: Thread | null
  messages: Record<string, Message[]>
  isLoading: boolean
  
  setThreads(threads): void
  setCurrentThread(thread): void
  setMessages(threadId, messages): void
  addMessage(message): void
  updateThread(thread): void
  setLoading(loading): void
}
```

**Usage:**
```tsx
import { useChatStore } from "@/lib/store/chat.store"

export function ChatScreen() {
  const { threads, currentThread, addMessage } = useChatStore()
  
  const handleSendMessage = (content) => {
    addMessage({ ...newMessage })
  }
}
```

---

## Icons

**Web:** `lucide-react`
**Mobile:** `lucide-react-native`

**Key icons used:**
- `Plus` - New chat button
- `Search` - Search icon
- `ChevronLeft` - Back button
- `Send` - Send message
- `Paperclip` - Attachment button
- `Eye` / `EyeOff` - Password toggle
- `X` - Close/Remove

**Usage:**
```tsx
import { Plus, Search } from "lucide-react-native"

<Plus size={24} color={colors.foreground} />
```

---

## Navigation Patterns

### Route Groups

**Auth group:** `app/(auth)/`
- `login.tsx` - Login screen
- `register.tsx` - Register screen
- `onboarding.tsx` - Profile setup

**Chat group:** `app/(chat)/`
- `index.tsx` - Threads list
- `[threadId].tsx` - Thread detail
- `new.tsx` - New conversation

**Usage:**
```tsx
import { Link } from "expo-router"

<Link href="/(chat)/123">
  <Text>Open thread</Text>
</Link>

// Or programmatically
const router = useRouter()
router.push("/(chat)/123")
```

---

## Form Handling

**Web:** React Hook Form + Zod
**Mobile:** React Hook Form + Zod (identical)

**Validation schemas reused:**
```ts
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
```

**Mobile form example:**
```tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
})

<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <Input
      value={value}
      onChangeText={onChange}
      error={errors.email?.message}
    />
  )}
/>
```

---

## Media Handling

**File:** `/mobile/lib/media.ts`

**Functions:**
- `pickImage(allowsMultiple)` - Open image picker
- `takePhoto()` - Open camera
- `pickDocument()` - Open document picker
- `uploadMedia(file)` - Upload file (mock)

**Usage:**
```tsx
import { pickImage, uploadMedia } from "@/lib/media"

const handlePickImage = async () => {
  const image = await pickImage(false)
  if (image) {
    const url = await uploadMedia(image)
  }
}
```

---

## Socket.io Integration

**File:** `/mobile/lib/socket.ts`

**Functions:**
- `initializeSocket(token)` - Initialize socket connection
- `getSocket()` - Get active socket
- `disconnectSocket()` - Close connection
- `onNewMessage(callback)` - Listen to new messages
- `emitMessage(threadId, content)` - Send message

**Usage:**
```tsx
import { initializeSocket, onNewMessage } from "@/lib/socket"

useEffect(() => {
  const socket = initializeSocket(authToken)
  
  onNewMessage((message) => {
    addMessage(message)
  })
}, [authToken])
```

---

## Performance Optimization

### FlatList Configuration
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

### Image Loading
```tsx
import { Image } from "expo-image"

<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
/>
```

### Memory Management
```tsx
useEffect(() => {
  const subscription = socket.on('message', handler)
  
  return () => subscription.off() // Cleanup
}, [])
```

---

## Common Patterns

### Controlled Component
```tsx
const [text, setText] = useState("")

<TextInput value={text} onChangeText={setText} />
```

### Conditional Rendering
```tsx
{isLoading ? (
  <Spinner />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <FlatList data={data} />
)}
```

### Safe Area
```tsx
import { SafeAreaView } from "react-native-safe-area-context"

<SafeAreaView style={{ flex: 1 }}>
  {/* Content */}
</SafeAreaView>
```

### Keyboard Avoiding
```tsx
import { KeyboardAvoidingView } from "react-native"

<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
  <TextInput />
</KeyboardAvoidingView>
```
