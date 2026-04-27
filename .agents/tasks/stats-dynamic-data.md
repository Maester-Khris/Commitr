# Task: stats-page-dynamic — wire stats page to Supabase

## Goal
Replace all mock/static data in the stats page with real Supabase queries.
Aggregation happens in Postgres — the client receives pre-computed results only.
No raw session rows are ever fetched for display purposes.

## Prerequisites (consider already done)
- `stats-page-static` task is complete
- SQL from `stats-supabase-schema.sql` has been run in Supabase SQL editor
- Views and RPC function exist and return data

---

## Architecture

```
HistogramSection
  → statsService.getAggregatedSessions()
  → queries view: sessions_by_{granularity}

ContributionGrid
  → statsService.getContributionGrid()
  → calls rpc: get_contribution_grid

SummaryCards
  → statsService.getSummaryStats()
  → calls rpc: get_summary_stats
```

All queries go through `statsService.ts`. No component touches Supabase directly.

---

## 1. `statsService.ts` — new file
Location: `src/services/statsService.ts`

### Types (add to `src/types/index.ts`)
```ts
export type Granularity = 'day' | 'week' | 'month' | 'year'

export interface AggregatedBar {
  label: string        // display label for x-axis
  period: string       // ISO date string for filtering
  totalSeconds: number
}

export interface ContributionDay {
  day: string          // ISO date
  level: number        // 0-4
  totalSeconds: number
}

export interface SummaryStats {
  totalSeconds: number
  dailyAverageSeconds: number
  sessionCount: number
  topProjectId: string | null
  topProjectName: string | null
}
```

### `getAggregatedSessions`
```ts
getAggregatedSessions(
  granularity: Granularity,
  projectId: string | 'all',
  startDate: string,   // ISO date string
  endDate: string
): Promise<AggregatedBar[]>
```

Queries the appropriate view based on granularity:
```ts
const view = `sessions_by_${granularity}` // sessions_by_day, sessions_by_week etc.

let query = supabase
  .from(view)
  .select('period, total_seconds, session_count')
  .gte('period', startDate)
  .lte('period', endDate)
  .order('period', { ascending: true })

if (projectId !== 'all') {
  query = query.eq('project_id', projectId)
}
```

Map response to `AggregatedBar[]`:
```ts
const toBar = (row: any, granularity: Granularity): AggregatedBar => ({
  period: row.period,
  label: formatPeriodLabel(row.period, granularity),
  totalSeconds: row.total_seconds,
})
```

### `getContributionGrid`
```ts
getContributionGrid(
  projectId: string | 'all',
  startDate: string,
  endDate: string
): Promise<ContributionDay[]>
```

```ts
const { data, error } = await supabase.rpc('get_contribution_grid', {
  p_project_id: projectId === 'all' ? null : projectId,
  p_start_date: startDate,
  p_end_date: endDate,
})
```

Map to `ContributionDay[]`:
```ts
const toContributionDay = (row: any): ContributionDay => ({
  day: row.day,
  level: row.level,
  totalSeconds: row.total_seconds,
})
```

### `getSummaryStats`
```ts
getSummaryStats(
  projectId: string | 'all',
  startDate: string,
  endDate: string
): Promise<SummaryStats>
```

```ts
const { data, error } = await supabase.rpc('get_summary_stats', {
  p_project_id: projectId === 'all' ? null : projectId,
  p_start_date: startDate,
  p_end_date: endDate,
})

return {
  totalSeconds: data.total_seconds,
  dailyAverageSeconds: data.daily_average_seconds,
  sessionCount: data.session_count,
  topProjectId: data.top_project_id,
  topProjectName: data.top_project_name,
}
```

On any Supabase error, throw `new Error(error.message)`.

---

## 2. `statsHelpers.ts` — formatting only
Location: `src/lib/statsHelpers.ts`

Remove all aggregation logic. Keep only pure formatting functions:

```ts
// Format seconds as "Xh Ym"
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

// Format a period ISO string to a display label based on granularity
export const formatPeriodLabel = (
  period: string,
  granularity: Granularity
): string => {
  const date = new Date(period)
  switch (granularity) {
    case 'day':   return date.getDate().toString()
    case 'week':  return `W${getISOWeek(date)}`
    case 'month': return date.toLocaleString('default', { month: 'short' })
    case 'year':  return date.getFullYear().toString()
  }
}

// Simple ISO week number helper
const getISOWeek = (date: Date): number => {
  const d = new Date(date)
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
```

---

## 3. `useStats.ts` — new hook
Location: `src/hooks/useStats.ts`

```ts
interface UseStatsReturn {
  bars: AggregatedBar[]
  summary: SummaryStats | null
  grid: ContributionDay[]
  loading: boolean
  error: string | null
}

export const useStats = (
  granularity: Granularity,
  projectId: string | 'all',
  startDate: string,
  endDate: string
): UseStatsReturn
```

- Calls all three service methods in parallel using `Promise.all`
- Re-fetches when any of the 4 params change (useEffect dependency array)
- Sets `loading: true` before fetch, `false` after
- Sets `error` string on failure

```ts
useEffect(() => {
  let cancelled = false
  setLoading(true)

  Promise.all([
    statsService.getAggregatedSessions(granularity, projectId, startDate, endDate),
    statsService.getSummaryStats(projectId, startDate, endDate),
    statsService.getContributionGrid(projectId, startDate, endDate),
  ])
    .then(([bars, summary, grid]) => {
      if (cancelled) return
      setBars(bars)
      setSummary(summary)
      setGrid(grid)
      setError(null)
    })
    .catch(e => {
      if (cancelled) return
      setError(e.message)
    })
    .finally(() => {
      if (!cancelled) setLoading(false)
    })

  return () => { cancelled = true }
}, [granularity, projectId, startDate, endDate])
```

The `cancelled` flag prevents state updates on unmounted components when
the user navigates away mid-fetch.

---

## 4. `StatsPage.tsx` — wire the hook

```ts
// Time window state lives here
const [granularity, setGranularity] = useState<Granularity>('month')
const [activeScope, setActiveScope] = useState<string>('all')
const [windowStart, setWindowStart] = useState<string>(
  startOfMonth(new Date()).toISOString()
)
const [windowEnd, setWindowEnd] = useState<string>(
  endOfMonth(new Date()).toISOString()
)

const { bars, summary, grid, loading, error } = useStats(
  granularity, activeScope, windowStart, windowEnd
)
```

Navigation arrow handler — shifts window by one unit of granularity:
```ts
const shiftWindow = (direction: 1 | -1) => {
  const start = new Date(windowStart)
  switch (granularity) {
    case 'day':
      start.setDate(start.getDate() + direction); break
    case 'week':
      start.setDate(start.getDate() + direction * 7); break
    case 'month':
      start.setMonth(start.getMonth() + direction); break
    case 'year':
      start.setFullYear(start.getFullYear() + direction); break
  }
  setWindowStart(startOf(granularity, start).toISOString())
  setWindowEnd(endOf(granularity, start).toISOString())
}
```

Add `startOf` and `endOf` helpers to `statsHelpers.ts`:
```ts
export const startOf = (granularity: Granularity, date: Date): Date
export const endOf = (granularity: Granularity, date: Date): Date
```

Pass down to children:
```tsx
<HistogramSection
  bars={bars}
  summary={summary}
  projects={projects}
  activeScope={activeScope}
  granularity={granularity}
  windowStart={windowStart}
  loading={loading}
  onScopeChange={setActiveScope}
  onGranularityChange={handleGranularityChange}
  onNavigate={shiftWindow}
/>
<ContributionGrid grid={grid} />
```

When `granularity` changes, reset window to current period:
```ts
const handleGranularityChange = (g: Granularity) => {
  setGranularity(g)
  setWindowStart(startOf(g, new Date()).toISOString())
  setWindowEnd(endOf(g, new Date()).toISOString())
}
```

---

## 5. `HistogramSection` — accept real data

Replace all internal state/mock with props:

```ts
interface HistogramSectionProps {
  bars: AggregatedBar[]
  summary: SummaryStats | null
  projects: Project[]
  activeScope: string
  granularity: Granularity
  windowStart: string
  loading: boolean
  onScopeChange: (id: string) => void
  onGranularityChange: (g: Granularity) => void
  onNavigate: (direction: 1 | -1) => void
}
```

Bar rendering:
```ts
const maxValue = Math.max(...bars.map(b => b.totalSeconds), 1)
// height % = (bar.totalSeconds / maxValue) * 100
```

Bar color:
```ts
const barColor = activeScope === 'all'
  ? '#378ADD'
  : projects.find(p => p.id === activeScope)?.color ?? '#378ADD'
```

Period label in chart header — derive from `windowStart` and `granularity`:
```ts
const periodLabel = formatWindowLabel(windowStart, granularity)
// e.g. 'Apr 2026', 'W17 2026', '2026'
```

Add `formatWindowLabel` to `statsHelpers.ts`.

Loading state: when `loading` is true, render bars as skeleton placeholders
(same height structure, muted background, no values).

Summary cards use `formatDuration(summary.totalSeconds)` etc.
Top project: use `summary.topProjectName ?? '—'`.

---

## 6. `ContributionGrid` — accept real data

```ts
interface ContributionGridProps {
  grid: ContributionDay[]
}
```

Build a lookup map for O(1) access per day:
```ts
const dayMap = new Map(grid.map(d => [d.day, d]))
```

Iterate 52 weeks × 7 days, look up each day in the map:
```ts
const level = dayMap.get(isoDate)?.level ?? 0
```

No other changes to rendering.

---

## File checklist
```
src/
  types/
    index.ts                      ← updated (new stat types + Granularity)
  services/
    statsService.ts               ← new
  hooks/
    useStats.ts                   ← new
  lib/
    statsHelpers.ts               ← updated (formatting only, add window helpers)
  components/
    StatsPage.tsx                 ← updated (hook wired, window state)
    stats/
      HistogramSection.tsx        ← updated (real props, loading state)
      ContributionGrid.tsx        ← updated (real grid prop)
  tests/
    statsService.test.ts          ← new
    useStats.test.ts              ← new
    statsHelpers.test.ts          ← new (formatDuration, formatPeriodLabel)
```

### `statsService.test.ts` covers:
- `getAggregatedSessions` maps view rows to `AggregatedBar[]`
- `getAggregatedSessions` filters by projectId when not 'all'
- `getSummaryStats` maps RPC response to `SummaryStats`
- `getContributionGrid` maps RPC response to `ContributionDay[]`
- All three throw on Supabase error

### `useStats.test.ts` covers:
- Returns loading true during fetch
- Populates bars, summary, grid on success
- Sets error string on failure
- Cancels stale fetch on param change

### `statsHelpers.test.ts` covers:
- `formatDuration(3661)` → `'1h 1m'`
- `formatDuration(0)` → `'0h 0m'`
- `startOf('month', date)` returns first day of month at midnight
- `endOf('month', date)` returns last day of month

---

## Do nots
- Do not fetch raw sessions rows anywhere in the stats page
- Do not aggregate in JS — all grouping and summing happens in Postgres
- Do not inline service calls in components — use `useStats` hook only
- Do not keep any mock/hardcoded bar or grid data in components
- Do not pass `sessions: Session[]` to StatsPage — it only receives aggregated types

---

## Definition of done
- Stats page loads real data from Supabase on mount
- Switching scope pills refetches with correct project filter
- Switching granularity tabs resets window and refetches
- Navigation arrows shift the window and refetch
- Contribution grid reflects real session history
- Loading skeleton shows during fetch
- `npm run test` passes for all 3 new test files
- `npm run build` succeeds with no TypeScript errors