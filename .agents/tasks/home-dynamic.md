# Task: home-ui-dynamic-2-supabase — wire Supabase data

## Goal
Replace static mock data with real Supabase calls.
No UI changes — component tree stays identical to task 1.
Only the data layer changes.

---

## Prerequisites
- Task `home-ui-dynamic-1-ui` is complete and tests pass
- Supabase `projects` table exists with correct schema
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` injected via Doppler

---

## What changes in this task

### 1. `projectService.ts` — new file
Location: `src/services/projectService.ts`

```ts
// fetch all projects ordered by created_at asc
getProjects(): Promise<Project[]>

// insert and return the created row
createProject(name: string, color: string): Promise<Project>
```

Row mapper — always use this, never access raw rows elsewhere:
```ts
const toProject = (row: any): Project => ({
  id: row.id,
  name: row.name,
  color: row.color,
  createdAt: row.created_at,
})
```

On Supabase error, throw a plain `Error` with the message from
`error.message` — do not swallow errors silently.

---

### 2. `useProjects.ts` — new hook
Location: `src/hooks/useProjects.ts`

```ts
// Returns:
{
  projects: Project[]
  loading: boolean
  error: string | null
  addProject: (name: string, color: string) => Promise<Project>
}
```

- Calls `projectService.getProjects()` on mount
- `addProject` calls `projectService.createProject()`, appends the
  returned project to local state — no full refetch
- Sets `error` string on failure, does not throw out of the hook

---

### 3. `Layout.tsx` — swap mock for real hook

Remove `useMock()`. Replace with `useProjects()`.

Initialize `timerStates` once projects load:
```ts
useEffect(() => {
  if (projects.length && Object.keys(timerStates).length === 0) {
    const initial = Object.fromEntries(
      projects.map(p => [p.id, {
        projectId: p.id,
        secondsRemaining: 1500,
        totalSecondsToday: 0,
        isRunning: false,
      }])
    )
    setTimerStates(initial)
    setActiveProjectId(projects[0].id)
  }
}, [projects])
```

Update `handleProjectAdd` — now async, calls `addProject` from the hook:
```ts
const handleProjectAdd = async (name: string, color: string) => {
  const newProject = await addProject(name, color)
  setTimerStates(prev => ({
    ...prev,
    [newProject.id]: {
      projectId: newProject.id,
      secondsRemaining: 1500,
      totalSecondsToday: 0,
      isRunning: false,
    }
  }))
  setShowAddPanel(false)
}
```

Pass `loading={addingProject}` to `HomePage` → `AddProjectPanel`
so Save button shows disabled state during the Supabase insert.

Add loading and error states in Layout render:
```tsx
if (loading) return (
  <div className="flex-1 flex items-center justify-center
    text-sm text-muted">Loading projects...</div>
)
if (error) return (
  <div className="flex-1 flex items-center justify-center
    text-sm text-red-400">{error}</div>
)
```

---

### 4. `useMock.ts` — retire
Keep the file but empty its usage from Layout.
Add a comment at the top:
```ts
// Retired in home-ui-dynamic-2-supabase.
// Kept for reference. Do not use in production code.
```

Do not delete the file — it may be useful for future test stubs.

---

## File checklist
```
src/
  services/
    projectService.ts       ← new
  hooks/
    useProjects.ts          ← new
  components/
    Layout.tsx              ← updated (real hook, async handler, loading/error)
  tests/
    projectService.test.ts  ← new
    useProjects.test.ts     ← new
```

### `projectService.test.ts` covers:
- `getProjects` returns mapped `Project[]` on success
- `getProjects` throws on Supabase error
- `createProject` returns a mapped `Project` on success
- `createProject` throws on Supabase error

Mock the Supabase client — do not call real Supabase in tests:
```ts
vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))
```

### `useProjects.test.ts` covers:
- `projects` is populated after mount
- `loading` is true during fetch, false after
- `error` is set when service throws
- `addProject` appends to projects without refetching

---

## Do nots
- Do not call `projectService` directly from any component
- Do not refetch the full project list after `createProject` — use the returned row
- Do not import `useMock` anywhere after this task
- Do not swallow Supabase errors silently in the service

---

## Definition of done
- Projects load from Supabase on page mount
- Adding a project persists to Supabase and appears in the selector immediately
- Save button is disabled during the insert request
- Loading and error states render correctly in Layout
- `npm run test` passes for all 4 test files (2 new + 2 from task 1)
- `npm run build` succeeds with no TypeScript errors