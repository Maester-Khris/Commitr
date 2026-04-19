export type NavPage = 'home' | 'profile' | 'stats'

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
