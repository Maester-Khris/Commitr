import { useState, useRef, useEffect } from 'react'
import { useMock } from '../hooks/useMock'
import NavBar from './NavBar'
import HomePage from './HomePage'
import ProfilePage from './ProfilePage'
import StatsPage from './StatsPage'
import type { NavPage, ProjectTimerState, Project } from '../types'

function makeTimerState(projectId: string): ProjectTimerState {
  return { projectId, secondsRemaining: 1500, totalSecondsToday: 0, isRunning: false }
}

function initTimerStates(projects: Project[]): Record<string, ProjectTimerState> {
  return Object.fromEntries(projects.map(p => [p.id, makeTimerState(p.id)]))
}

export default function Layout() {
  const { projects: initialProjects, activeProjectId: defaultProjectId } = useMock()

  const [projects, setProjects] = useState(initialProjects)
  const [activePage, setActivePage] = useState<NavPage>('home')
  const [activeProjectId, setActiveProjectId] = useState(defaultProjectId)
  const [timerStates, setTimerStates] = useState<Record<string, ProjectTimerState>>(
    () => initTimerStates(initialProjects)
  )
  const [toast, setToast] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function handleProjectSelect(projectId: string) {
    setTimerStates(prev => {
      const current = prev[activeProjectId]
      if (current?.isRunning) {
        stopInterval()
        const projectName = projects.find(p => p.id === activeProjectId)?.name ?? ''
        setToast(`Session paused for ${projectName}`)
        return { ...prev, [activeProjectId]: { ...current, isRunning: false } }
      }
      return prev
    })
    setActiveProjectId(projectId)
  }

  function handleTimerToggle() {
    setTimerStates(prev => {
      const state = prev[activeProjectId]
      if (!state) return prev

      if (state.isRunning) {
        stopInterval()
        return { ...prev, [activeProjectId]: { ...state, isRunning: false } }
      }

      intervalRef.current = setInterval(() => {
        setTimerStates(curr => {
          const s = curr[activeProjectId]
          if (!s || s.secondsRemaining <= 0) {
            stopInterval()
            return s ? { ...curr, [activeProjectId]: { ...s, isRunning: false } } : curr
          }
          return {
            ...curr,
            [activeProjectId]: {
              ...s,
              secondsRemaining: s.secondsRemaining - 1,
              totalSecondsToday: s.totalSecondsToday + 1,
            },
          }
        })
      }, 1000)

      return { ...prev, [activeProjectId]: { ...state, isRunning: true } }
    })
  }

  function handleProjectAdd(name: string, color: string) {
    const id = `project-${Date.now()}`
    setProjects(prev => [...prev, { id, name, color, createdAt: new Date().toISOString() }])
    setTimerStates(prev => ({ ...prev, [id]: makeTimerState(id) }))
  }

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden" style={{ background: '#111318' }}>
      <NavBar activePage={activePage} onNavigate={setActivePage} />

      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 flex px-4 py-6 md:px-20 md:py-8">
        {activePage === 'home' && (
          <HomePage
            projects={projects}
            activeProjectId={activeProjectId}
            timerStates={timerStates}
            onProjectSelect={handleProjectSelect}
            onTimerToggle={handleTimerToggle}
            onProjectAdd={handleProjectAdd}
          />
        )}
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'stats' && <StatsPage />}
      </div>
    </div>
  )
}
