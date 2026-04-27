# Task: stats-page-static — stats page UI (static)

## Goal
Build the full stats page UI with static/mock data.
Two stacked components: histogram with controls, and 365-day contribution grid.
No Supabase, no service calls. All values hardcoded.

---

## Page structure

`StatsPage` is a single column, full width, no centering card.
Two sections stacked vertically, separated by a divider:

```
┌─────────────────────────────────────────┐
│  [scope pills]          [Day|Week|Month|Year] │  ← control bar
│                                          │
│  Time tracked              ‹ Apr 2026 › │  ← chart header
│  [histogram]                             │
│  [summary cards]                         │
├─────────────────────────────────────────┤
│  365-day activity          Less ░▒▓█ More│  ← grid header
│  [contribution grid]                     │
└─────────────────────────────────────────┘
```

---

## Component 1 — `HistogramSection`
Location: `src/components/stats/HistogramSection.tsx`

### Props
```ts
interface HistogramSectionProps {
  projects: Project[]
}
```

### Internal state (all static for now)
```ts
const [activeScope, setActiveScope] = useState<string>('all')
const [activeGranularity, setActiveGranularity] = useState<'day'|'week'|'month'|'year'>('week')
const [period, setPeriod] = useState('Apr 2026')
```

### Control bar
Two groups on the same row, space-between:

**Left — scope pills** (horizontal scroll on overflow):
```tsx
<div className="flex items-center gap-2 overflow-x-auto">
  <button className={scopeClass('all')}>All projects</button>
  {projects.map(p => (
    <button key={p.id} className={scopeClass(p.id)}>
      <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
      {p.name}
    </button>
  ))}
</div>
```

Active scope pill: `border-border-primary bg-background-secondary font-medium`.
Inactive: `border-border-secondary text-muted`.
All pills: `text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0`.

**Right — granularity tabs:**
```tsx
<div className="flex border border-border rounded-md overflow-hidden flex-shrink-0">
  {['Day','Week','Month','Year'].map(g => (
    <button key={g} className={granClass(g)}>{g}</button>
  ))}
</div>
```

Active tab: `bg-background-secondary text-primary font-medium`.
All tabs: `text-xs px-3 py-1.5 border-r border-border last:border-r-0`.

### Chart header
```tsx
<div className="flex items-center justify-between mt-5 mb-4">
  <span className="text-sm font-medium">Time tracked</span>
  <div className="flex items-center gap-2">
    <button className="w-6 h-6 border border-border rounded flex items-center
      justify-center text-muted text-xs">‹</button>
    <span className="text-xs text-muted w-20 text-center">{period}</span>
    <button className="w-6 h-6 border border-border rounded flex items-center
      justify-center text-muted text-xs">›</button>
  </div>
</div>
```

Navigation buttons are visible but do nothing in static version.

### Histogram
Render as a pure CSS/SVG bar chart. No chart library.

Static data — 20 bars representing weeks in Apr 2026:
```ts
const BARS = [
  { label: '1',  value: 1.5 },
  { label: '',   value: 4.2 },
  { label: '',   value: 7.0 },
  { label: '',   value: 2.8 },
  { label: '6',  value: 9.5 },
  { label: '',   value: 12.0 },
  { label: '',   value: 5.5 },
  { label: '',   value: 8.0 },
  { label: '13', value: 14.0 },
  { label: '',   value: 11.0 },
  { label: '',   value: 6.5 },
  { label: '',   value: 4.0 },
  { label: '20', value: 8.5 },
  { label: '',   value: 5.0 },
  { label: '',   value: 2.5 },
  { label: '',   value: 1.0 },
  { label: '27', value: 2.0 },
  { label: '',   value: 0.5 },
  { label: '',   value: 1.0 },
  { label: '',   value: 0.0 },
]
const MAX_VALUE = 16
```

Render using flexbox bars — no SVG, no canvas, no library:
```tsx
<div className="relative h-36 flex items-end gap-1 pl-8">
  <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between">
    <span className="text-[10px] text-muted">16h</span>
    <span className="text-[10px] text-muted">8h</span>
    <span className="text-[10px] text-muted">0</span>
  </div>
  <div className="flex-1 flex items-end gap-1
    border-b border-border pb-0">
    {BARS.map((bar, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div
          className="w-full rounded-t-sm"
          style={{
            height: `${(bar.value / MAX_VALUE) * 100}%`,
            background: activeScope === 'all'
              ? '#378ADD'
              : projects.find(p => p.id === activeScope)?.color ?? '#378ADD',
            minHeight: bar.value > 0 ? '2px' : '0',
          }}
        />
        <span className="text-[9px] text-muted mt-1">{bar.label}</span>
      </div>
    ))}
  </div>
</div>
```

### Summary cards
Four metric cards below the histogram, in a 4-column grid:

```tsx
const SUMMARY = [
  { value: '47h 20m', label: 'Total this month' },
  { value: '1h 32m',  label: 'Daily average' },
  { value: '18',      label: 'Sessions logged' },
  { value: 'Commitr', label: 'Top project' },
]
```

```tsx
<div className="grid grid-cols-4 gap-3 mt-4">
  {SUMMARY.map(s => (
    <div key={s.label} className="bg-background-secondary rounded-lg p-3">
      <div className="text-lg font-medium">{s.value}</div>
      <div className="text-[10px] text-muted mt-1">{s.label}</div>
    </div>
  ))}
</div>
```

---

## Component 2 — `ContributionGrid`
Location: `src/components/stats/ContributionGrid.tsx`

### Props
```ts
interface ContributionGridProps {
  // no props in static version — data is self-contained
}
```

### Layout
```tsx
<div className="p-5 pb-6">
  <div className="flex items-center justify-between mb-3">
    <span className="text-sm font-medium">365-day activity</span>
    <Legend />
  </div>
  <div className="flex">
    <DayLabels />
    <div className="overflow-x-auto">
      <MonthLabels />
      <Grid />
    </div>
  </div>
</div>
```

### Legend
```tsx
const LEGEND_COLORS = ['','#B5D4F4','#378ADD','#185FA5','#0C447C']

<div className="flex items-center gap-1.5 text-[10px] text-muted">
  Less
  <div className="flex gap-0.5">
    {[0,1,2,3,4].map(l => (
      <div key={l} className="w-2.5 h-2.5 rounded-sm"
        style={{ background: l === 0 ? undefined : LEGEND_COLORS[l],
          border: l === 0 ? '0.5px solid var(--color-border-tertiary)' : undefined,
          background: l === 0 ? 'var(--color-background-secondary)' : LEGEND_COLORS[l] }}
      />
    ))}
  </div>
  More
</div>
```

### Day labels
```tsx
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

<div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
  {DAY_LABELS.map((d, i) => (
    <div key={i} className="h-[11px] w-7 text-[9px] text-muted flex items-center">
      {d}
    </div>
  ))}
</div>
```

### Month labels
52 weeks = 52 columns. Distribute month labels proportionally:
```ts
const MONTHS = [
  { label: 'May', week: 0 },  { label: 'Jun', week: 4 },
  { label: 'Jul', week: 8 },  { label: 'Aug', week: 13 },
  { label: 'Sep', week: 17 }, { label: 'Oct', week: 22 },
  { label: 'Nov', week: 26 }, { label: 'Dec', week: 30 },
  { label: 'Jan', week: 35 }, { label: 'Feb', week: 39 },
  { label: 'Mar', week: 43 }, { label: 'Apr', week: 48 },
]
```

Render as absolutely positioned labels over a 52-column flex container.
Each column is `11px` wide + `3px` gap = `14px` per week unit.

### Grid generation
Generate 52 weeks × 7 days of static cells.
Use a seeded pattern so the grid looks realistic (more activity in recent weeks):

```ts
const getLevel = (weekIndex: number, dayIndex: number): number => {
  const seed = (weekIndex * 7 + dayIndex) % 17
  const isRecent = weekIndex > 40
  if (seed < 5) return 0
  if (seed < 9) return isRecent ? 2 : 1
  if (seed < 13) return isRecent ? 3 : 2
  if (seed < 15) return isRecent ? 4 : 3
  return isRecent ? 4 : 1
}

const CELL_COLORS = [
  'var(--color-background-secondary)',
  '#B5D4F4', '#378ADD', '#185FA5', '#0C447C'
]
```

Each cell:
```tsx
<div
  style={{
    width: '11px', height: '11px', borderRadius: '2px',
    background: level === 0 ? CELL_COLORS[0] : CELL_COLORS[level],
    border: level === 0 ? '0.5px solid var(--color-border-tertiary)' : undefined,
    flexShrink: 0,
  }}
/>
```

---

## `StatsPage` — root component
Location: `src/components/StatsPage.tsx`

```tsx
export default function StatsPage({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      <HistogramSection projects={projects} />
      <ContributionGrid />
    </div>
  )
}
```

Pass `projects` from `Layout` down through `HomePage`-equivalent routing.

---

## File checklist
```
src/
  components/
    StatsPage.tsx               ← updated (real UI, static)
    stats/
      HistogramSection.tsx      ← new
      ContributionGrid.tsx      ← new
  tests/
    HistogramSection.test.ts    ← new
    ContributionGrid.test.ts    ← new
```

### `HistogramSection.test.ts` covers:
- Renders all 4 granularity tabs
- Clicking a scope pill marks it active
- Histogram renders correct number of bars (20)
- Summary cards render all 4 values

### `ContributionGrid.test.ts` covers:
- Renders 52 × 7 = 364 cells minimum
- Legend renders 5 color stops
- Month labels render all 12 months

---

## Do nots
- Do not use any chart library (Recharts, Chart.js, D3) — pure CSS bars only
- Do not fetch data — all values are hardcoded static constants
- Do not make scope or granularity tabs functional beyond visual active state
- Do not make navigation arrows functional in this task
- Do not add mobile responsive layout in this task — desktop only

---

## Definition of done
- Stats nav pill navigates to the stats page
- Both sections render correctly with no overflow or layout breaks
- Scope pills and granularity tabs switch active state on click
- Contribution grid fills horizontally with overflow-x scroll if needed
- `npm run test` passes for both new test files
- `npm run build` succeeds with no TypeScript errors