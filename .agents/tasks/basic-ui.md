# Task: home-ui-basic — Home page scaffold

## Goal
Build the static home page of Commitr following the component architecture defined in CLAUDE.md.
Everything is static in this task — no Supabase calls, no real timers yet.
All data comes from `useMock.ts`. State is lifted to the Layout level.

---

## What to build

### 1. `useMock.ts` — static data hook
Location: `src/hooks/useMock.ts`

Returns all static data the app needs. This hook is the single source of truth for mock data during development. It will be replaced by real service calls later — do not inline data anywhere else.

```ts
// Shape of data to return:
{
  projects: Project[]        // list of projects
  sessions: Session[]        // list of past sessions (empty array for now)
  activeProjectId: string    // id of the default selected project
}
```

Use types from `src/types/index.ts`. Populate with 4 sample projects:
- Commitr (blue)
- Deep Work (green)
- Admin (coral/orange)
- Learning (purple)

Each project has: `id`, `name`, `color`, `createdAt`.

---

### 2. Types
Location: `src/types/index.ts`

Define and export:

```ts
type NavPage = 'home' | 'profile' | 'stats'

interface Project {
  id: string
  name: string
  color: string
  createdAt: string
}

interface Session {
  id: string
  projectId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
}

// Per-project timer state (local UI state, not persisted yet)
interface ProjectTimerState {
  projectId: string
  secondsRemaining: number   // default: 1500 (25 min)
  totalSecondsToday: number  // default: 0
  isRunning: boolean
}
```

---

### 3. `Layout` component
Location: `src/components/Layout.tsx`

This is the root component. It:
- Calls `useMock()` to get projects and sessions
- Owns `activePage: NavPage` state
- Owns `activeProjectId: string` state
- Owns `timerStates: Record<string, ProjectTimerState>` — one entry per project, keyed by project id
- Renders `<NavBar>` and the active page component
- Passes down only what each child needs (no prop drilling beyond one level)

```tsx
// Rough structure
<div>
  <NavBar activePage={activePage} onNavigate={setActivePage} />
  {activePage === 'home' && (
    <HomePage
      projects={projects}
      activeProjectId={activeProjectId}
      timerStates={timerStates}
      onProjectSelect={handleProjectSelect}
      onTimerToggle={handleTimerToggle}
      onProjectAdd={handleProjectAdd}
    />
  )}
  {activePage === 'profile' && <ProfilePage />}
  {activePage === 'stats' && <StatsPage />}
</div>
```

Handler stubs to implement in Layout:
- `handleProjectSelect(projectId: string)` — update `activeProjectId`. If currently running project is switched, stop its timer first, show session toast feedback.
- `handleTimerToggle()` — toggle `isRunning` on the active project's timer state
- `handleProjectAdd(name: string, color: string)` — append a new project to the projects list with a generated id, add a default `ProjectTimerState` entry for it

---

### 4. `NavBar` component
Location: `src/components/NavBar.tsx`

Props:
```ts
interface NavBarProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
}
```

Renders:
- Logo text "Commitr" on the left
- Nav pill group on the right with: Home, Profile, Stats
- Active page is highlighted
- Fully dumb — no internal state

---

### 5. `HomePage` component
Location: `src/components/HomePage.tsx`

Props:
```ts
interface HomePageProps {
  projects: Project[]
  activeProjectId: string
  timerStates: Record<string, ProjectTimerState>
  onProjectSelect: (id: string) => void
  onTimerToggle: () => void
  onProjectAdd: (name: string, color: string) => void
}
```

Renders three sub-components (each dumb):
- `<PlayerButton>` — the circular timer button
- `<ProjectSelector>` — pill dropdown + add button
- `<SessionStatus>` — live dot + status text + today's total

No logic in HomePage itself — it derives the active timer state and passes it down:
```ts
const activeTimer = timerStates[activeProjectId]
const activeProject = projects.find(p => p.id === activeProjectId)
```

---

### 6. `PlayerButton` component
Location: `src/components/PlayerButton.tsx`

Props:
```ts
interface PlayerButtonProps {
  isRunning: boolean
  secondsRemaining: number
  projectColor: string
  onToggle: () => void
}
```

Renders:
- Circle button: shows play triangle when idle, shows MM:SS countdown when running
- When running: orbiting dot animation on the border (canvas or CSS animation, single dot with a trailing ghost)
- The orbit dot color matches `projectColor`
- Label "remaining" shown below MM:SS when running
- Fully dumb — no timer logic, receives secondsRemaining as prop

---

### 7. `ProjectSelector` component
Location: `src/components/ProjectSelector.tsx`

Props:
```ts
interface ProjectSelectorProps {
  projects: Project[]
  activeProjectId: string
  onSelect: (id: string) => void
  onAdd: (name: string, color: string) => void
}
```

Renders:
- Pill showing active project name + color dot + chevron
- Dropdown opens upward (above pill, so it does not cover PlayerButton)
- Dropdown list is scrollable with max-height, newest projects at bottom
- Last item in dropdown is always "+ New project" (separated by a divider)
- Slide animation on project name change: current name slides up-out, new name slides up-in (ease-in-out)
- "+" icon button to the right of the pill — triggers same add flow as dropdown item
- Add flow for now: generate a name ("New Project N") and pick next color from a fixed palette — no modal yet
- Has internal state only for: `isDropdownOpen: boolean`

---

### 8. `SessionStatus` component
Location: `src/components/SessionStatus.tsx`

Props:
```ts
interface SessionStatusProps {
  isRunning: boolean
  projectName: string
  totalSecondsToday: number
}
```

Renders:
- When idle: "Click to start session"
- When running: green dot + "{projectName} · running"
- When totalSecondsToday > 0: "· {projectName} today: {N}m" appended
- Fully dumb

---

### 9. `ProfilePage` and `StatsPage`
Locations: `src/components/ProfilePage.tsx`, `src/components/StatsPage.tsx`

Static placeholder only:
```tsx
// ProfilePage
export default function ProfilePage() {
  return <div style={{ padding: '2rem' }}>Profile — coming soon</div>
}

// StatsPage
export default function StatsPage() {
  return <div style={{ padding: '2rem' }}>Stats — coming soon</div>
}
```

---

## Timer logic note
The actual `setInterval` countdown lives in `Layout` inside `handleTimerToggle`.
`PlayerButton` is purely display — it receives `secondsRemaining` as a prop updated by Layout's interval.
This keeps all side effects in one place and makes components easy to test.

---

## Styling
- Use Tailwind utility classes throughout
- Follow color tokens: project colors are passed as hex strings from mock data
- No hardcoded colors in components — always use the color prop or Tailwind semantic classes
- NavBar: bottom border separator
- Dropdown: opens upward, max-height 160px, overflow-y scroll

---

## File checklist
```
src/
  types/
    index.ts
  hooks/
    useMock.ts
  components/
    Layout.tsx
    NavBar.tsx
    HomePage.tsx
    PlayerButton.tsx
    ProjectSelector.tsx
    SessionStatus.tsx
    ProfilePage.tsx
    StatsPage.tsx
  tests/
    useMock.test.ts         ← verify mock data shape matches types
    ProjectSelector.test.ts ← verify project switch calls onSelect
    SessionStatus.test.ts   ← verify correct text renders per state
```

---

## Definition of done
- `npm run dev` loads the app with the home page visible
- Clicking the circle toggles between idle and running state (visual only — no real countdown yet)
- Switching projects slides the name and resets visual state for that project
- Nav pills switch between Home (real), Profile (placeholder), Stats (placeholder)
- `npm run test` passes for the 3 test files above
- `npm run build` succeeds with no TypeScript errors