import type { Session, Project } from '../types'

type Granularity = 'day' | 'week' | 'month' | 'year'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfWeekMonday(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1))
  r.setHours(0, 0, 0, 0)
  return r
}

function windowBounds(granularity: Granularity, anchorDate: Date): { start: Date; end: Date } {
  switch (granularity) {
    case 'day': {
      const start = new Date(anchorDate)
      start.setHours(0, 0, 0, 0)
      return { start, end: new Date(start.getTime() + 86400_000) }
    }
    case 'week': {
      const start = startOfWeekMonday(anchorDate)
      return { start, end: new Date(start.getTime() + 7 * 86400_000) }
    }
    case 'month': {
      const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
      const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1)
      return { start, end }
    }
    case 'year': {
      const start = new Date(anchorDate.getFullYear(), 0, 1)
      const end = new Date(anchorDate.getFullYear() + 1, 0, 1)
      return { start, end }
    }
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function aggregateByGranularity(
  sessions: Session[],
  granularity: Granularity,
  scopeProjectId: string,
  anchorDate: Date = new Date()
): { label: string; value: number }[] {
  const scoped = scopeProjectId === 'all' ? sessions : sessions.filter(s => s.projectId === scopeProjectId)
  const { start, end } = windowBounds(granularity, anchorDate)
  const startMs = start.getTime()
  const endMs = end.getTime()

  const inWindow = scoped.filter(s => {
    const t = new Date(s.startedAt).getTime()
    return t >= startMs && t < endMs
  })

  switch (granularity) {
    case 'day': {
      const buckets = Array.from({ length: 24 }, (_, h) => ({
        label: h % 6 === 0 ? `${h}h` : '',
        value: 0,
      }))
      inWindow.forEach(s => {
        buckets[new Date(s.startedAt).getHours()].value += (s.durationSeconds ?? 0) / 3600
      })
      return buckets.map(b => ({ ...b, value: round1(b.value) }))
    }
    case 'week': {
      const buckets = DAY_NAMES.map(d => ({ label: d, value: 0 }))
      inWindow.forEach(s => {
        const day = new Date(s.startedAt).getDay()
        const idx = day === 0 ? 6 : day - 1
        buckets[idx].value += (s.durationSeconds ?? 0) / 3600
      })
      return buckets.map(b => ({ ...b, value: round1(b.value) }))
    }
    case 'month': {
      const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate()
      const sparseLabels = new Set([1, 7, 14, 21, 28])
      const buckets = Array.from({ length: daysInMonth }, (_, i) => ({
        label: sparseLabels.has(i + 1) ? String(i + 1) : '',
        value: 0,
      }))
      inWindow.forEach(s => {
        const d = new Date(s.startedAt).getDate() - 1
        if (d >= 0 && d < daysInMonth) buckets[d].value += (s.durationSeconds ?? 0) / 3600
      })
      return buckets.map(b => ({ ...b, value: round1(b.value) }))
    }
    case 'year': {
      const buckets = MONTH_NAMES.map(m => ({ label: m, value: 0 }))
      inWindow.forEach(s => {
        buckets[new Date(s.startedAt).getMonth()].value += (s.durationSeconds ?? 0) / 3600
      })
      return buckets.map(b => ({ ...b, value: round1(b.value) }))
    }
  }
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0 && m === 0) return '0m'
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function totalDuration(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
}

export function dailyAverage(sessions: Session[]): number {
  if (sessions.length === 0) return 0
  const activeDays = new Set(sessions.map(s => s.startedAt.slice(0, 10))).size
  return Math.round(totalDuration(sessions) / activeDays)
}

export function topProject(sessions: Session[], projects: Project[]): Project | null {
  if (sessions.length === 0 || projects.length === 0) return null
  const totals: Record<string, number> = {}
  sessions.forEach(s => {
    totals[s.projectId] = (totals[s.projectId] ?? 0) + (s.durationSeconds ?? 0)
  })
  const topId = Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0]
  return projects.find(p => p.id === topId) ?? null
}

export function contributionGrid(sessions: Session[]): number[][] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentWeekMonday = new Date(now)
  currentWeekMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  currentWeekMonday.setHours(0, 0, 0, 0)

  const gridStart = new Date(currentWeekMonday)
  gridStart.setDate(currentWeekMonday.getDate() - 51 * 7)

  const dayCounts: Record<string, number> = {}
  sessions.forEach(s => {
    const key = s.startedAt.slice(0, 10)
    dayCounts[key] = (dayCounts[key] ?? 0) + 1
  })

  return Array.from({ length: 52 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = new Date(gridStart)
      day.setDate(gridStart.getDate() + w * 7 + d)
      const count = dayCounts[day.toISOString().slice(0, 10)] ?? 0
      if (count === 0) return 0
      if (count < 3)  return 1
      if (count < 5)  return 2
      if (count < 9)  return 3
      return 4
    })
  )
}

export function periodLabel(granularity: Granularity, anchorDate: Date): string {
  switch (granularity) {
    case 'day':
      return `${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getDate()}, ${anchorDate.getFullYear()}`
    case 'week': {
      const start = startOfWeekMonday(anchorDate)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}–${end.getDate()}`
      }
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`
    }
    case 'month':
      return `${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
    case 'year':
      return String(anchorDate.getFullYear())
  }
}

export function gridMonthLabels(): { label: string; week: number }[] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentWeekMonday = new Date(now)
  currentWeekMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  currentWeekMonday.setHours(0, 0, 0, 0)

  const gridStart = new Date(currentWeekMonday)
  gridStart.setDate(currentWeekMonday.getDate() - 51 * 7)

  const labels: { label: string; week: number }[] = []
  let lastMonth = -1

  for (let w = 0; w < 52; w++) {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + w * 7)
    const month = day.getMonth()
    if (month !== lastMonth && w <= 49) {
      labels.push({ label: MONTH_NAMES[month], week: w })
      lastMonth = month
    }
  }

  return labels
}
