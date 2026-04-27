import type { Project, ProjectTimerState } from '../types'
import PlayerButton from './PlayerButton'
import ProjectSelector from './ProjectSelector'
import SessionStatus from './SessionStatus'
import AddProjectPanel from './AddProjectPanel'
import ResetTimerPrompt from './ResetTimer'

interface HomePageProps {
  projects: Project[]
  activeProjectId: string
  timerStates: Record<string, ProjectTimerState>
  onProjectSelect: (id: string) => void
  onTimerToggle: () => void
  onTimerReset: () => void
  showAddPanel: boolean
  onShowAddPanel: () => void
  onHideAddPanel: () => void
  onProjectAdd: (name: string, color: string) => void
  loading?: boolean
}

export default function HomePage({
  projects,
  activeProjectId,
  timerStates,
  onProjectSelect,
  onTimerToggle,
  onTimerReset,
  showAddPanel,
  onShowAddPanel,
  onHideAddPanel,
  onProjectAdd,
  loading,
}: HomePageProps) {
  const activeTimer = timerStates[activeProjectId]
  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full min-h-[90vh] p-8 text-slate-200">
      <div className={`flex flex-col md:flex-row items-center justify-center transition-all duration-700 ease-in-out ${showAddPanel ? 'gap-16 md:gap-32' : 'gap-0'}`}>

        {/* Left Section: Timer & Controls */}
        <div className="flex flex-col items-center gap-10 w-full max-w-[340px]">
          <PlayerButton
            isRunning={activeTimer?.isRunning ?? false}
            secondsRemaining={activeTimer?.secondsRemaining ?? 1500}
            projectColor={activeProject?.color ?? '#378ADD'}
            onToggle={onTimerToggle}
          />

          <div className="w-full flex flex-col items-center gap-8">
            {activeTimer?.isPaused ? (
              <ResetTimerPrompt
                secondsRemaining={activeTimer.secondsRemaining}
                projectName={activeProject?.name ?? ''}
                onResume={onTimerToggle}
                onReset={onTimerReset}
              />
            ) : (
              <SessionStatus
                isRunning={activeTimer?.isRunning ?? false}
                projectName={activeProject?.name ?? ''}
                totalSecondsToday={activeTimer?.totalSecondsToday ?? 0}
              />
            )}

            <ProjectSelector
              projects={projects}
              activeProjectId={activeProjectId}
              onSelect={onProjectSelect}
              onAdd={onShowAddPanel}
              showingAddPanel={showAddPanel}
            />
          </div>

          {/* Mobile Add Panel (Directly below) */}
          {showAddPanel && (
            <div className="md:hidden w-full animate-in fade-in zoom-in slide-in-from-top-8 duration-500">
              <AddProjectPanel onSave={onProjectAdd} onCancel={onHideAddPanel} loading={loading} />
            </div>
          )}
        </div>

        {/* Desktop Add Panel (Side-by-side) */}
        {showAddPanel && (
          <>
            <div className="hidden md:block w-[1px] h-80 bg-[#26292F] animate-in fade-in duration-700" />
            <div className="hidden md:block w-full max-w-[420px] animate-in fade-in slide-in-from-left-12 duration-700">
              <AddProjectPanel onSave={onProjectAdd} onCancel={onHideAddPanel} loading={loading} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
