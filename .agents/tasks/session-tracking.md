# Task: timer-session-persistence — timer reset + session save + notifications

## Goal
Three focused improvements to the timer flow:
1. Offer a reset option when resuming a paused timer
2. Save completed/stopped sessions to Supabase
3. Show a notification when a timer finishes

No UI structure changes. No new pages.

---

## What changes in this task

### 1. `sessionService.ts` — new file
Location: `src/services/sessionService.ts`

```ts
// Insert a completed session row, return the created row
createSession(
  projectId: string,
  startedAt: string,
  endedAt: string,
  durationSeconds: number
): Promise<Session>
```

Row mapper:
```ts
const toSession = (row: any): Session => ({
  id: row.id,
  projectId: row.project_id,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  durationSeconds: row.duration_seconds,
})
```

On Supabase error, throw a plain `Error` with `error.message`.
No other methods needed in this task.

---

### 2. `ProjectTimerState` — extend the type
Location: `src/types/index.ts`

Add two fields:
```ts
interface ProjectTimerState {
  projectId: string
  secondsRemaining: number
  totalSecondsToday: number
  isRunning: boolean
  startedAt: string | null      // ISO string, set when timer starts, cleared on reset
  isPaused: boolean             // true when stopped mid-session (secondsRemaining < 1500)
}
```

Update all initializers of `ProjectTimerState` in `Layout.tsx` and
`useProjects.ts` to include `startedAt: null, isPaused: false`.

---

### 3. `Layout.tsx` — timer logic update

#### On timer start
Set `startedAt` to `new Date().toISOString()` on the active project's
timer state when `isRunning` transitions from false → true for the
first time in a session (i.e. `startedAt` is null).

If `isPaused` is true (timer was previously stopped mid-session),
do not overwrite `startedAt` — keep the original start time so the
session duration is accurate.

#### On timer stop (`handleTimerToggle` when running → stopped)
- Set `isRunning: false`, `isPaused: true`
- Save the session immediately:

```ts
const st = timerStates[activeProjectId]
const durationSeconds = 1500 - st.secondsRemaining
if (durationSeconds > 5 && st.startedAt) {
  await sessionService.createSession(
    activeProjectId,
    st.startedAt,
    new Date().toISOString(),
    durationSeconds
  )
  // update totalSecondsToday
  setTimerStates(prev => ({
    ...prev,
    [activeProjectId]: {
      ...prev[activeProjectId],
      totalSecondsToday: prev[activeProjectId].totalSecondsToday + durationSeconds,
      isRunning: false,
      isPaused: true,
    }
  }))
}
```

#### On timer finish (secondsRemaining hits 0)
Same save logic as stop, then:
- Set `isRunning: false, isPaused: false, secondsRemaining: 1500, startedAt: null`
- Trigger notification: `showNotification({ type: 'finished', projectName })`

#### New handler: `handleTimerReset`
```ts
const handleTimerReset = () => {
  setTimerStates(prev => ({
    ...prev,
    [activeProjectId]: {
      ...prev[activeProjectId],
      secondsRemaining: 1500,
      isPaused: false,
      startedAt: null,
    }
  }))
}
```

Pass `onTimerReset={handleTimerReset}` down to `HomePage`.

#### Notification state in Layout
```ts
const [notification, setNotification] = useState<{
  message: string
  projectName: string
} | null>(null)

const showNotification = (projectName: string) => {
  setNotification({ message: 'Session complete', projectName })
}

const dismissNotification = () => setNotification(null)
```

Pass `notification` and `onDismissNotification` to `HomePage`
which passes them to `NotificationBanner`.

---

### 4. `ResetTimerPrompt` — new component
Location: `src/components/ResetTimerPrompt.tsx`

Shown inline below `PlayerButton` when `isPaused` is true and
`isRunning` is false. Replaces the "Click to start session" status text.

Props:
```ts
interface ResetTimerPromptProps {
  secondsRemaining: number
  projectName: string
  onResume: () => void
  onReset: () => void
}
```

Renders:
```
"Deep Work — 22:14 remaining"
[Resume]  [Reset]
```

- Both buttons are small, text-weight, minimal style
- `Resume` calls `onResume` (same as `onTimerToggle`)
- `Reset` calls `onReset`
- Fully dumb — no internal state

In `HomePage`, replace `<SessionStatus>` with `<ResetTimerPrompt>`
when `activeTimer.isPaused` is true.

---

### 5. `NotificationBanner` — new component
Location: `src/components/NotificationBanner.tsx`

Props:
```ts
interface NotificationBannerProps {
  projectName: string
  message: string
  onDismiss: () => void
}
```

Renders at the bottom of the viewport as a fixed-position banner.
Since `position: fixed` is available in React (not an SVG widget),
use it here:

```tsx
<div className="fixed bottom-6 left-1/2 -translate-x-1/2
  flex items-center gap-3 px-5 py-3
  bg-background-secondary border border-border-secondary
  rounded-lg text-sm z-50">
  <span className="text-success">●</span>
  <span><strong>{projectName}</strong> — {message}</span>
  <button onClick={onDismiss} className="ml-4 text-muted hover:text-primary">✕</button>
</div>
```

Auto-dismiss after 6 seconds using a `useEffect` with a `setTimeout`
inside the component — call `onDismiss` when it fires.
Clear the timeout on unmount.

Render `NotificationBanner` at the bottom of `Layout`'s JSX,
outside the page content, conditionally on `notification !== null`.

---

### 6. `HomePage.tsx` — prop additions

Add to `HomePageProps`:
```ts
onTimerReset: () => void
notification: { message: string; projectName: string } | null
onDismissNotification: () => void
```

Pass `onTimerReset` down to `PlayerButton` (for resume/reset logic)
and render `<ResetTimerPrompt>` when `activeTimer.isPaused`.

---

## File checklist
```
src/
  types/
    index.ts                    ← updated (startedAt, isPaused)
  services/
    sessionService.ts           ← new
  components/
    ResetTimerPrompt.tsx        ← new
    NotificationBanner.tsx      ← new
    HomePage.tsx                ← updated (ResetTimerPrompt, new props)
    Layout.tsx                  ← updated (session save, reset, notification state)
  tests/
    sessionService.test.ts      ← new
    NotificationBanner.test.ts  ← new
    ResetTimerPrompt.test.ts    ← new
```

### `sessionService.test.ts` covers:
- `createSession` returns a mapped `Session` on success
- `createSession` throws on Supabase error

### `NotificationBanner.test.ts` covers:
- Renders project name and message
- Calls `onDismiss` when ✕ is clicked
- Calls `onDismiss` automatically after 6 seconds

### `ResetTimerPrompt.test.ts` covers:
- Displays formatted time remaining and project name
- `onResume` called on Resume click
- `onReset` called on Reset click

---

## Do nots
- Do not save sessions shorter than 5 seconds (noise filter)
- Do not reset `startedAt` on pause — only on explicit reset or finish
- Do not call `sessionService` from any component directly
- Do not use `position: fixed` anywhere except `NotificationBanner`
- Do not auto-dismiss the notification in Layout — let `NotificationBanner` own that timeout

---

## Definition of done
- Stopping a mid-session timer saves a session row in Supabase
- Completing a timer saves a session row and shows the notification banner
- Notification auto-dismisses after 6 seconds or on ✕ click
- Paused timer shows Resume / Reset options instead of the start prompt
- Resuming continues from the paused time, not from 25:00
- Resetting clears to 25:00 with no session saved
- `npm run test` passes for all 3 new test files
- `npm run build` succeeds with no TypeScript errors