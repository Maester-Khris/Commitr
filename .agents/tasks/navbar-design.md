# Task: navbar-redesign — user identity pill + mobile drawer

## Goal
Update `NavBar` to a startup-quality design with a user identity pill
(dropdown) on desktop and a hamburger drawer on mobile.
No auth logic changes. No new context. UI only.

---

## Design spec

### Desktop (md and above)
```
[brand mark] Commitr          [Home] [Stats]          [avatar + username ▾]
```

- **Profile nav item is removed from the pill group** — it is accessible
  via the identity dropdown instead
- Nav items: `Home` and `Stats` only in the center group
- Right side: identity pill (see below)

### Mobile (below md)
```
[brand mark] Commitr                        [avatar initial] [☰]
```
- Tapping the hamburger opens a full-width dropdown drawer below the navbar
- Drawer contains: user identity block → nav items → divider → sign out

---

## 1. `NavBar.tsx` — full update

### Props (unchanged interface, no new props needed)
```ts
interface NavBarProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
  userEmail?: string
  onSignOut?: () => void
}
```

Derive display name inside NavBar:
```ts
const displayName =
  user?.user_metadata?.display_name ||
  user?.user_metadata?.full_name ||
  userEmail?.split('@')[0] ||
  'User'

const avatarInitial = displayName.charAt(0).toUpperCase()
```

Read `user` from `useAuth()` directly inside NavBar — it already has
access to the context. No need to pass user as a prop.

---

### Desktop layout

```tsx
<nav className="flex items-center justify-between px-6 h-[52px]
  border-b border-border bg-background-primary">

  <BrandMark />

  <div className="flex items-center gap-0.5">
    <NavItem page="home" />
    <NavItem page="stats" />
  </div>

  <IdentityPill />

</nav>
```

#### `IdentityPill` (internal sub-component, same file)
A pill-shaped button that opens a dropdown on click.

Pill (closed state):
```tsx
<div className="flex items-center gap-1.5 pl-1 pr-3 py-1
  rounded-full border border-border-secondary
  bg-background-secondary cursor-pointer
  hover:border-border-primary transition-colors">
  <Avatar initial={avatarInitial} />
  <span className="text-xs font-medium text-primary">{displayName}</span>
  <ChevronDownIcon />
</div>
```

Dropdown (open state) — appears below the pill, right-aligned:
```
┌─────────────────────┐
│ displayName         │  ← 13px, font-weight 500
│ email               │  ← 11px, muted
├─────────────────────┤
│ ⊙  Profile          │  ← navigates to 'profile', closes dropdown
├─────────────────────┤
│ → Sign out          │  ← danger color
└─────────────────────┘
```

```tsx
<div className="absolute right-0 top-[calc(100%+8px)] w-[200px]
  bg-background-primary border border-border-secondary
  rounded-lg overflow-hidden z-50 shadow-none">
  <div className="px-3 py-2.5 border-b border-border-tertiary">
    <p className="text-sm font-medium text-primary">{displayName}</p>
    <p className="text-xs text-muted mt-0.5">{userEmail}</p>
  </div>
  <div className="p-1.5">
    <DropdownItem icon={<ProfileIcon />} label="Profile"
      onClick={() => { onNavigate('profile'); closeDropdown() }} />
  </div>
  <div className="border-t border-border-tertiary p-1.5">
    <DropdownItem icon={<SignOutIcon />} label="Sign out"
      onClick={onSignOut} danger />
  </div>
</div>
```

Close dropdown on: outside click, Escape key, item selection.
Use `useRef` + document `mousedown` listener for outside click detection.

---

### Mobile layout

```tsx
<nav className="md:hidden flex items-center justify-between
  px-4 h-[48px] border-b border-border bg-background-primary">
  <BrandMark />
  <div className="flex items-center gap-2">
    <Avatar initial={avatarInitial} size="sm" />
    <HamburgerButton onClick={toggleDrawer} isOpen={drawerOpen} />
  </div>
</nav>
```

#### Mobile drawer
Renders directly below the navbar (not a modal, not fixed position).
Full width. Controlled by `drawerOpen` local state.

```tsx
{drawerOpen && (
  <div className="md:hidden border-b border-border-secondary
    bg-background-primary">
    <div className="px-4 py-3 border-b border-border-tertiary">
      <p className="text-sm font-medium text-primary">{displayName}</p>
      <p className="text-xs text-muted mt-0.5">{userEmail}</p>
    </div>
    <div className="p-2 flex flex-col gap-0.5">
      <DrawerNavItem page="home" label="Home" icon={<HomeIcon />} />
      <DrawerNavItem page="profile" label="Profile" icon={<ProfileIcon />} />
      <DrawerNavItem page="stats" label="Stats" icon={<StatsIcon />} />
    </div>
    <div className="border-t border-border-tertiary p-2">
      <DrawerNavItem label="Sign out" icon={<SignOutIcon />}
        onClick={onSignOut} danger />
    </div>
  </div>
)}
```

`DrawerNavItem` is a local sub-component — same file:
```ts
interface DrawerNavItemProps {
  page?: NavPage
  label: string
  icon: React.ReactNode
  onClick?: () => void
  danger?: boolean
}
```
Active page item gets `bg-background-secondary font-medium`.
Tapping any item closes the drawer.

Close drawer on: nav item tap, sign out, outside click.

---

## 2. `BrandMark` sub-component (internal, same file)

```tsx
const BrandMark = () => (
  <div className="flex items-center gap-2 flex-shrink-0">
    <div className="w-[22px] h-[22px] rounded-md bg-[#378ADD]
      flex items-center justify-center">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5"
          stroke="white" strokeWidth="1.5"/>
        <path d="M6.5 4v2.5l1.5 1.5"
          stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="text-sm font-medium tracking-tight">Commitr</span>
  </div>
)
```

---

## 3. `Avatar` sub-component (internal, same file)

```tsx
interface AvatarProps {
  initial: string
  size?: 'sm' | 'md'
}

const Avatar = ({ initial, size = 'md' }: AvatarProps) => (
  <div className={`rounded-full bg-[#185FA5] border border-[#378ADD]
    flex items-center justify-center font-medium text-[#B5D4F4]
    flex-shrink-0
    ${size === 'sm' ? 'w-[26px] h-[26px] text-[11px]' : 'w-[28px] h-[28px] text-[12px]'}`}>
    {initial}
  </div>
)
```

---

## 4. All icons — inline SVG, no library

Define as local constants at the top of the file:

```tsx
const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5"
    className="text-muted">
    <path d="M4 6l4 4 4-4"/>
  </svg>
)

const ProfileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="6" r="3"/>
    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/>
  </svg>
)

const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H7"/>
  </svg>
)

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M2 7l6-5 6 5v7H10v-4H6v4H2z"/>
  </svg>
)

const StatsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12l4-4 3 3 5-7"/>
  </svg>
)
```

---

## 5. `Layout.tsx` — minor update

Pass `userEmail` to `NavBar`:
```tsx
const { user, session } = useAuth()

<NavBar
  activePage={activePage}
  onNavigate={setActivePage}
  userEmail={user?.email}
  onSignOut={handleSignOut}
/>
```

`handleSignOut` in Layout:
```ts
const handleSignOut = async () => {
  await signOut()
  // session clears → auth gate in Layout renders AuthPage automatically
}
```

---

## File checklist
```
src/
  components/
    NavBar.tsx        ← full rewrite
    Layout.tsx        ← updated (userEmail prop, handleSignOut)
  tests/
    NavBar.test.ts    ← updated
```

### `NavBar.test.ts` covers:
- Renders brand mark and name
- Desktop: renders Home and Stats nav items, not Profile
- Desktop: identity pill shows display name
- Desktop: clicking pill opens dropdown with Profile and Sign out
- Desktop: clicking outside closes dropdown
- Mobile: hamburger toggles drawer
- Mobile: drawer contains Home, Profile, Stats, Sign out
- Sign out calls `onSignOut`
- Active page item has active styling

---

## Do nots
- Do not render Profile as a nav pill on desktop — it lives in the dropdown only
- Do not use `position: fixed` for the dropdown or drawer
- Do not import any icon library — all icons are inline SVG
- Do not add any new context or auth state
- Do not change `NavBarProps` interface — only internal implementation changes
- Do not add animations or transitions beyond simple `transition-colors`

---

## Definition of done
- Desktop: nav shows Home + Stats pills + identity pill on the right
- Desktop: clicking identity pill opens dropdown with Profile link and Sign out
- Desktop: clicking outside or pressing Escape closes the dropdown
- Desktop: clicking Profile in dropdown navigates to profile page
- Mobile: hamburger opens full-width drawer below navbar
- Mobile: drawer shows user identity + all nav items + sign out
- Mobile: tapping any drawer item closes it
- Display name shows `display_name` from user metadata, falls back to email prefix
- `npm run test` passes for NavBar tests
- `npm run build` succeeds with no TypeScript errors