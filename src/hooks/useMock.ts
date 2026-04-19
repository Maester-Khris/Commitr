import type { Project, Session } from '../types'
import { PROJECT_COLORS } from '../components/AddProjectPanel'

export function useMock() {
  const projects: Project[] = [
    { id: '1', name: 'Commitr', color: PROJECT_COLORS[0], createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'Deep Work', color: PROJECT_COLORS[1], createdAt: '2024-01-01T00:00:00Z' },
    { id: '3', name: 'Admin', color: PROJECT_COLORS[2], createdAt: '2024-01-01T00:00:00Z' },
    { id: '4', name: 'Learning', color: PROJECT_COLORS[3], createdAt: '2024-01-01T00:00:00Z' },
  ]

  const sessions: Session[] = []

  const activeProjectId = '1'

  return { projects, sessions, activeProjectId }
}
