import { useState } from 'react'
import type { Project, ProjectTimerState } from '../types'
import PlayerButton from './PlayerButton'
import ProjectSelector from './ProjectSelector'
import SessionStatus from './SessionStatus'

interface HomePageProps {
  projects: Project[]
  activeProjectId: string
  timerStates: Record<string, ProjectTimerState>
  onProjectSelect: (id: string) => void
  onTimerToggle: () => void
  onProjectAdd: (name: string, color: string) => void
}

export default function HomePage({
  projects,
  activeProjectId,
  timerStates,
  onProjectSelect,
  onTimerToggle,
  onProjectAdd,
}: HomePageProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const activeTimer = timerStates[activeProjectId]
  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[calc(100vh-64px)]"
      style={{
        transform: isDropdownOpen ? 'translateY(-80px)' : 'translateY(0)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <PlayerButton
        isRunning={activeTimer?.isRunning ?? false}
        secondsRemaining={activeTimer?.secondsRemaining ?? 1500}
        projectColor={activeProject?.color ?? '#3B82F6'}
        onToggle={onTimerToggle}
      />

      <SessionStatus
        isRunning={activeTimer?.isRunning ?? false}
        projectName={activeProject?.name ?? ''}
        totalSecondsToday={activeTimer?.totalSecondsToday ?? 0}
      />

      <ProjectSelector
        projects={projects}
        activeProjectId={activeProjectId}
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        onSelect={onProjectSelect}
        onAdd={onProjectAdd}
      />
    </main>
  )
}
