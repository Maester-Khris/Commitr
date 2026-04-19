# Task: home-ui-dynamic-1-ui — add project panel UI (static)

## Goal
Build the `AddProjectPanel` component and wire it into the existing
static home page. No Supabase, no service calls. All data stays in
`useMock.ts`. State lifted to Layout as usual.

---

## What changes in this task

### 1. `AddProjectPanel.tsx` — new component
Location: `src/components/AddProjectPanel.tsx`

Self-contained, fully dumb form. No service imports, no async logic.

Props:
```ts
interface AddProjectPanelProps {
  onSave: (name: string, color: string) => void
  onCancel: () => void
  loading?: boolean
}
```

Renders:
- Text input for project name (controlled, local state only)
- Color swatch grid — 8 swatches, first color pre-selected by default
- Cancel button — always active, calls `onCancel`
- Save button — disabled when name is empty or `loading` is true
- No Supabase calls, no service imports

Export the fixed color palette from this file:
```ts
export const PROJECT_COLORS = [
  '#378ADD', '#1D9E75', '#D85A30', '#9F77DD',
  '#E24B4A', '#BA7517', '#D4537E', '#888780',
]
```

Import `PROJECT_COLORS` in `useMock.ts` and anywhere else that
needs colors — do not duplicate the array.

---

### 2. `Layout.tsx` — add panel visibility state

Add to Layout:
```ts
const [showAddPanel, setShowAddPanel] = useState(false)
```

Add handler:
```ts
const handleProjectAdd = (name: string, color: string) => {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    color,
    createdAt: new Date().toISOString(),
  }
  setProjects(prev => [...prev, newProject])
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

Pass to `HomePage`:
```ts
showAddPanel={showAddPanel}
onShowAddPanel={() => setShowAddPanel(true)}
onHideAddPanel={() => setShowAddPanel(false)}
onProjectAdd={handleProjectAdd}
```

---

### 3. `HomePage.tsx` — layout split

Props update — add:
```ts
showAddPanel: boolean
onShowAddPanel: () => void
onHideAddPanel: () => void
onProjectAdd: (name: string, color: string) => void
```

Layout logic — two explicit conditional renders, one per breakpoint:

```tsx
<div className="flex-1 flex flex-col md:flex-row items-center
  justify-center transition-all duration-250">

  <div className="flex flex-col items-center gap-4">
    <PlayerButton ... />
    <SessionStatus ... />
    <ProjectSelector ... />

    {showAddPanel && (
      <div className="md:hidden w-full mt-3">
        <AddProjectPanel
          onSave={onProjectAdd}
          onCancel={onHideAddPanel}
        />
      </div>
    )}
  </div>

  {showAddPanel && (
    <>
      <div className="hidden md:block w-px self-stretch
        bg-border mx-8 my-6" />
      <div className="hidden md:block">
        <AddProjectPanel
          onSave={onProjectAdd}
          onCancel={onHideAddPanel}
        />
      </div>
    </>
  )}

</div>
```

---

### 4. `ProjectSelector.tsx` — wire the + button

The `+` button receives a new prop:
```ts
onAdd: () => void
```

On click it calls `onAdd` — nothing else. No internal state change.

---

## Behavior spec

| Action | Result |
|---|---|
| Click `+` button | `showAddPanel` becomes true, form slides in |
| Desktop form open | timer stays left, divider appears, form on right |
| Mobile form open | form slides in below the selector |
| Type a name | Save button becomes active |
| Click Save | project added to list, form closes, selector shows new project |
| Click Cancel | form closes, no changes |
| Escape key | same as Cancel |

---

## Animation

- Desktop: form enters with `opacity: 0 → 1` + `transform: translateX(16px) → translateX(0)`, 220ms ease-out
- Mobile: `max-height: 0 → 260px` with `overflow: hidden`, 280ms ease-in-out
- Use Tailwind `transition` classes where possible, inline style for max-height animation

---

## File checklist
```
src/
  components/
    AddProjectPanel.tsx     ← new
    HomePage.tsx            ← updated
    Layout.tsx              ← updated
    ProjectSelector.tsx     ← updated (onAdd prop)
  tests/
    AddProjectPanel.test.ts ← new
```

---

## Do nots
- Do not call any service or hook from `AddProjectPanel`
- Do not duplicate `PROJECT_COLORS` — import from `AddProjectPanel.tsx`
- Do not use CSS `display: none` to hide the panel — use conditional rendering
- Do not add form state to `Layout` or `HomePage`

---

## Definition of done
- `+` button opens the form panel in the correct position on both breakpoints
- Adding a project appends it to the selector immediately
- Cancel closes without side effects
- Escape key closes the form
- `npm run build` succeeds with no TypeScript errors