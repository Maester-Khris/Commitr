// Kept for reference/testing. generateMockSessions is used by Layout for the stats page.
import type { Project, Session } from '../types'
import { PROJECT_COLORS } from '../components/AddProjectPanel'

export const generateMockSessions = (projects: Project[]): Session[] => {
  if (projects.length === 0) return []
  const sessions: Session[] = []
  const now = new Date()

  for (let daysAgo = 364; daysAgo >= 0; daysAgo--) {
    if (Math.random() > 0.65) continue

    const sessionCount = Math.floor(Math.random() * 4) + 1

    for (let s = 0; s < sessionCount; s++) {
      const project = projects[Math.floor(Math.random() * projects.length)]
      const startedAt = new Date(now)
      startedAt.setDate(now.getDate() - daysAgo)
      startedAt.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0)

      const durationSeconds = (Math.floor(Math.random() * 40) + 10) * 60
      const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000)

      sessions.push({
        id: crypto.randomUUID(),
        projectId: project.id,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationSeconds,
      })
    }
  }

  return sessions
}

export function useMock() {
  const projects: Project[] = [
    { id: '1', name: 'Commitr', color: PROJECT_COLORS[0], createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'Deep Work', color: PROJECT_COLORS[1], createdAt: '2024-01-01T00:00:00Z' },
    { id: '3', name: 'Admin', color: PROJECT_COLORS[2], createdAt: '2024-01-01T00:00:00Z' },
    { id: '4', name: 'Learning', color: PROJECT_COLORS[3], createdAt: '2024-01-01T00:00:00Z' },
  ]

  const sessions = generateMockSessions(projects)
  const activeProjectId = '1'

  return { projects, sessions, activeProjectId }
}
