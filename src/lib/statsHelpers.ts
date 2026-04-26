import type { Granularity } from '../types'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfWeekMonday(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1))
  r.setHours(0, 0, 0, 0)
  return r
}

function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function formatDuration(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m`
}

export function formatPeriodLabel(period: string, granularity: Granularity): string {
  const date = new Date(period)
  switch (granularity) {
    case 'day':   return date.getUTCDate().toString()
    case 'week':  return `W${getISOWeek(date)}`
    case 'month': return MONTH_NAMES[date.getUTCMonth()]
    case 'year':  return date.getUTCFullYear().toString()
  }
}

export function formatWindowLabel(windowStart: string, granularity: Granularity): string {
  const date = new Date(windowStart)
  switch (granularity) {
    case 'day':   return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    case 'week':  return `W${getISOWeek(date)} ${date.getFullYear()}`
    case 'month': return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
    case 'year':  return String(date.getFullYear())
  }
}

export function startOf(granularity: Granularity, date: Date): Date {
  switch (granularity) {
    case 'day': {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'week':
      return startOfWeekMonday(date)
    case 'month':
      return new Date(date.getFullYear(), date.getMonth(), 1)
    case 'year':
      return new Date(date.getFullYear(), 0, 1)
  }
}

export function endOf(granularity: Granularity, date: Date): Date {
  switch (granularity) {
    case 'day': {
      const d = new Date(date)
      d.setHours(23, 59, 59, 999)
      return d
    }
    case 'week': {
      const start = startOfWeekMonday(date)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return end
    }
    case 'month':
      return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    case 'year':
      return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
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
