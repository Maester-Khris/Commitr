import type { Project, ProjectTimerState } from '../types'
import PlayerButton from './PlayerButton'
import ProjectSelector from './ProjectSelector'
import SessionStatus from './SessionStatus'
import AddProjectPanel from './AddProjectPanel'

interface HomePageProps {
  projects: Project[]
  activeProjectId: string
  timerStates: Record<string, ProjectTimerState>
  onProjectSelect: (id: string) => void
  onTimerToggle: () => void
  showAddPanel: boolean
  onShowAddPanel: () => void
  onHideAddPanel: () => void
  onProjectAdd: (name: string, color: string) => void
}

export default function HomePage({
  projects,
  activeProjectId,
  timerStates,
  onProjectSelect,
  onTimerToggle,
  showAddPanel,
  onShowAddPanel,
  onHideAddPanel,
  onProjectAdd,
}: HomePageProps) {
  const activeTimer = timerStates[activeProjectId]
  const activeProject = projects.find(p => p.id === activeProjectId)


  return (
    <main className="flex-1 flex items-center justify-center w-full min-h-0 p-6">
      <div className={`flex flex-col md:flex-row items-center justify-center transition-all duration-500 ease-in-out ${showAddPanel ? 'gap-12 md:gap-20' : 'gap-0'}`}>

        {/* Left Section: Timer & Controls */}
        <div className="flex flex-col items-center gap-6 w-full max-w-[320px]">
          <PlayerButton
            isRunning={activeTimer?.isRunning ?? false}
            secondsRemaining={activeTimer?.secondsRemaining ?? 1500}
            projectColor={activeProject?.color ?? '#378ADD'}
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
            onSelect={onProjectSelect}
            onAdd={onShowAddPanel}
            showingAddPanel={showAddPanel}
          />

          {/* Mobile Add Panel (Directly below) */}
          {showAddPanel && (
            <div className="md:hidden w-full animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
              <AddProjectPanel onSave={onProjectAdd} onCancel={onHideAddPanel} />
            </div>
          )}
        </div>

        {/* Desktop Add Panel (Side-by-side) */}
        {showAddPanel && (
          <>
            <div className="hidden md:block w-[1px] h-64 bg-[#26292F] animate-in fade-in duration-500" />
            <div className="hidden md:block w-full max-w-[380px] animate-in fade-in slide-in-from-left-8 duration-500">
              <AddProjectPanel onSave={onProjectAdd} onCancel={onHideAddPanel} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
