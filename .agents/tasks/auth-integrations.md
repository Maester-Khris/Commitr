# Task: auth-step-1 — authentication pages + service + context

## Goal
Add Supabase Auth to Commitr: email/password and Google OAuth.
Auth state lives in context and flows down through Layout.
No database migrations, no RLS changes, no component data updates — those are step 2.

---

## Prerequisites
- Supabase project has Google OAuth configured (Auth → Providers → Google)
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` injected via Doppler
- No new env vars needed — Supabase Auth uses the same client

---

## Architecture

```
AuthContext  (src/context/AuthContext.tsx)
  ↓ provides { user, session, loading, signIn, signUp, signInWithGoogle, signOut }
Layout
  ↓ reads auth state from useAuth()
  → if loading    : render <LoadingScreen />
  → if no session : render <AuthPage />
  → if session    : render current page (Home / Profile / Stats)
```

Auth never gets its own `NavPage` entry — it is a gate, not a page.

---

## 1. `authService.ts` — new file
Location: `src/services/authService.ts`

Pure Supabase calls. No React. No state. Returns typed results.

```ts
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

// Email + password sign up
signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }>

// Email + password sign in
signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }>

// Google OAuth — redirects browser, no return value needed
signInWithGoogle(): Promise<{ error: string | null }>

// Sign out
signOut(): Promise<{ error: string | null }>

// Get current session (used on mount)
getSession(): Promise<Session | null>
```

Implementation notes:
- Wrap every Supabase call in try/catch
- Return `{ error: error.message }` on failure — never throw out of the service
- Google OAuth uses:
  ```ts
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  ```
- Never import or reference any key directly — the supabase client is
  already configured in `src/lib/supabaseClient.ts` via Doppler-injected env vars

---

## 2. `AuthContext.tsx` — new file
Location: `src/context/AuthContext.tsx`

```ts
interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>  // returns error or null
  signUp: (email: string, password: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
}
```

Implementation:

```tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Restore session on mount
    authService.getSession().then(s => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    // 2. Listen to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password)
    return error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await authService.signUp(email, password)
    return error
  }

  const signInWithGoogle = async () => {
    const { error } = await authService.signInWithGoogle()
    return error
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

---

## 3. `app.tsx` — wrap app in AuthProvider

```tsx
// src/app.tsx
<AuthProvider>
  <Layout />
</AuthProvider>
```

`AuthProvider` wraps `Layout` — not the other way around.

---

## 4. `Layout.tsx` — auth gate

Import `useAuth` and add the gate at the top of the render:

```tsx
const { user, session, loading } = useAuth()

if (loading) return <LoadingScreen />
if (!session) return <AuthPage />

// existing Layout render continues here
```

No other changes to Layout in this task.
User data (`user.email`, `user.id`) is available in Layout and can be
passed down to child components as needed. Do not pass the full session object —
pass only what each component needs.

---

## 5. `AuthPage.tsx` — new component
Location: `src/components/AuthPage.tsx`

Single page that toggles between Sign In and Sign Up modes.
No routing — just a local `mode: 'signin' | 'signup'` state.

```ts
interface AuthPageProps {} // no props — reads from useAuth directly
```

Layout:
```
Commitr logo / wordmark      ← centered, top
─────────────────────────
[tab: Sign in] [tab: Sign up]

Email input
Password input               ← sign up only: show confirm password
[Submit button]

── or ──
[Continue with Google]       ← Google OAuth button

{error message if any}
```

Behavior:
- Submit calls `signIn` or `signUp` from `useAuth`
- On success: `onAuthStateChange` in `AuthContext` fires automatically,
  `session` becomes non-null, Layout unmounts `AuthPage` and renders the app
- On error: display the returned error string below the form
- Google button calls `signInWithGoogle` — browser redirects, no further handling needed
- Password field: `type="password"`, minimum 6 chars (Supabase default)
- Email field: `type="email"` for native validation
- Submit button disabled while request is in flight (`loading` local state)
- No forgot password flow in this task

Styling notes:
- Centered card, max-width `400px`, same dark theme as the rest of the app
- Google button: white/light background with Google icon — use an inline SVG
  for the Google logo (no external image dependency)
- Error message: small red text below the form, not a toast

---

## 6. `LoadingScreen.tsx` — new component
Location: `src/components/LoadingScreen.tsx`

Minimal full-screen centered spinner shown while session is being restored on mount.
Prevents flash of auth page on reload when user is already logged in.

```tsx
export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-primary
        rounded-full animate-spin" />
    </div>
  )
}
```

No props. No state.

---

## 7. Add `User` type export
Location: `src/types/index.ts`

Re-export Supabase's User type for use across the app:
```ts
export type { User, Session } from '@supabase/supabase-js'
```

Do not redefine a custom User type — use Supabase's directly.

---

## File checklist
```
src/
  services/
    authService.ts          ← new
  context/
    AuthContext.tsx          ← new
  components/
    AuthPage.tsx             ← new
    LoadingScreen.tsx        ← new
    Layout.tsx               ← updated (auth gate only)
  types/
    index.ts                 ← updated (re-export User, Session)
  main.tsx                   ← updated (AuthProvider wrapper)
  tests/
    authService.test.ts      ← new
    AuthContext.test.ts      ← new
```

### `authService.test.ts` covers:
- `signIn` returns `{ user, error: null }` on success
- `signIn` returns `{ user: null, error: string }` on failure
- `signUp` returns `{ user, error: null }` on success
- `signOut` calls `supabase.auth.signOut`
- `getSession` returns session or null

Mock the Supabase client:
```ts
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    }
  }
}))
```

### `AuthContext.test.ts` covers:
- `loading` is true on mount, false after session resolves
- `user` is null when no session
- `signIn` updates user state on success
- `signOut` clears user and session

---

## Do nots
- Do not hardcode any Supabase URL or key — use the existing `supabaseClient.ts`
- Do not create a custom User type — re-export from `@supabase/supabase-js`
- Do not add auth state to Layout's own state — read from `useAuth()`
- Do not pass the full `session` object as a prop — pass only `user.id` or `user.email` where needed
- Do not add forgot password or email verification flows in this task
- Do not modify any existing service (projectService, sessionService, statsService)
- Do not touch RLS policies or run any SQL — that is step 2

---

## Definition of done
- Unauthenticated users see the auth page, not the app
- Email/password sign in and sign up work end to end
- Google OAuth redirects correctly and logs user in on return
- Logged-in users land directly on the home page (no flash of auth page)
- Sign out clears session and returns to auth page
- Reloading the page while logged in restores session without re-authenticating
- `npm run test` passes for both new test files
- `npm run build` succeeds with no TypeScript errors