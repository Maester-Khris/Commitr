export type { User } from '@supabase/supabase-js'
export type { Session as AuthSession } from '@supabase/supabase-js'

export type NavPage = 'home' | 'profile' | 'stats'

export type Granularity = 'day' | 'week' | 'month' | 'year'

export interface AggregatedBar {
  label: string
  period: string
  totalSeconds: number
}

export interface ContributionDay {
  day: string
  level: number
  totalSeconds: number
}

export interface SummaryStats {
  totalSeconds: number
  dailyAverageSeconds: number
  sessionCount: number
  topProjectId: string | null
  topProjectName: string | null
}

export interface Project {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Session {
  id: string
  projectId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
}

export interface ProjectTimerState {
  projectId: string
  secondsRemaining: number
  totalSecondsToday: number
  isRunning: boolean
  startedAt: string | null
  isPaused: boolean
}

export interface UserProfile {
  id: string
  workDuration: number       // minutes, default 25
  shortBreakDuration: number // minutes, default 5
  longBreakDuration: number  // minutes, default 15
  createdAt: string
  updatedAt: string
}

export const toUserProfile = (row: any): UserProfile => ({
  id: row.id,
  workDuration: row.work_duration,
  shortBreakDuration: row.short_break_duration,
  longBreakDuration: row.long_break_duration,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})
