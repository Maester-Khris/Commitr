import type { Project, Session } from '../types'

export function useMock() {
  const projects: Project[] = [
    { id: '1', name: 'Commitr', color: '#3B82F6', createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'Deep Work', color: '#22C55E', createdAt: '2024-01-01T00:00:00Z' },
    { id: '3', name: 'Admin', color: '#F97316', createdAt: '2024-01-01T00:00:00Z' },
    { id: '4', name: 'Learning', color: '#A855F7', createdAt: '2024-01-01T00:00:00Z' },
  ]

  const sessions: Session[] = []

  const activeProjectId = '1'

  return { projects, sessions, activeProjectId }
}
