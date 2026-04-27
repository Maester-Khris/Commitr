import { useState, useRef, useEffect } from 'react'
import { useProjects } from '../hooks/useProjects'
import { sessionService } from '../services/sessionService'
import NavBar from './NavBar'
import HomePage from './HomePage'
import ProfilePage from './ProfilePage'
import StatsPage from './StatsPage'
import NotificationBanner from './NotificationBanner'
import type { NavPage, ProjectTimerState } from '../types'

function makeTimerState(projectId: string): ProjectTimerState {
  return {
    projectId,
    secondsRemaining: 1500,
    totalSecondsToday: 0,
    isRunning: false,
    startedAt: null,
    isPaused: false,
  }
}

export default function Layout() {
  const { projects, loading, error, addProject } = useProjects()

  const [activePage, setActivePage] = useState<NavPage>('home')
  const [activeProjectId, setActiveProjectId] = useState('')
  const [timerStates, setTimerStates] = useState<Record<string, ProjectTimerState>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addingProject, setAddingProject] = useState(false)
  const [notification, setNotification] = useState<{ message: string; projectName: string } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (projects.length && Object.keys(timerStates).length === 0) {
      const initial = Object.fromEntries(projects.map(p => [p.id, makeTimerState(p.id)]))
      setTimerStates(initial)
      setActiveProjectId(projects[0].id)
    }
  }, [projects])

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
        return { ...prev, [activeProjectId]: { ...current, isRunning: false, isPaused: true } }
      }
      return prev
    })
    setActiveProjectId(projectId)
  }

  async function handleTimerToggle() {
    const st = timerStates[activeProjectId]
    if (!st) return

    if (st.isRunning) {
      // Stop: save session if long enough
      stopInterval()
      const durationSeconds = 1500 - st.secondsRemaining
      if (durationSeconds > 5 && st.startedAt) {
        try {
          await sessionService.createSession(
            activeProjectId,
            st.startedAt,
            new Date().toISOString(),
            durationSeconds,
          )
        } catch {
          // session save failure is non-blocking
        }
        setTimerStates(prev => ({
          ...prev,
          [activeProjectId]: {
            ...prev[activeProjectId],
            totalSecondsToday: prev[activeProjectId].totalSecondsToday + durationSeconds,
            isRunning: false,
            isPaused: true,
          },
        }))
      } else {
        setTimerStates(prev => ({
          ...prev,
          [activeProjectId]: { ...prev[activeProjectId], isRunning: false, isPaused: true },
        }))
      }
      return
    }

    // Start
    const now = new Date().toISOString()
    setTimerStates(prev => {
      const s = prev[activeProjectId]
      return {
        ...prev,
        [activeProjectId]: {
          ...s,
          isRunning: true,
          startedAt: s.startedAt ?? now,
        },
      }
    })

    intervalRef.current = setInterval(() => {
      setTimerStates(curr => {
        const s = curr[activeProjectId]
        if (!s) return curr

        if (s.secondsRemaining <= 1) {
          stopInterval()
          const durationSeconds = 1500 - s.secondsRemaining + 1
          if (s.startedAt) {
            sessionService
              .createSession(activeProjectId, s.startedAt, new Date().toISOString(), durationSeconds)
              .catch(() => {})
          }
          const projectName = projects.find(p => p.id === activeProjectId)?.name ?? ''
          setNotification({ message: 'Session complete', projectName })
          return {
            ...curr,
            [activeProjectId]: {
              ...s,
              secondsRemaining: 1500,
              totalSecondsToday: s.totalSecondsToday + durationSeconds,
              isRunning: false,
              isPaused: false,
              startedAt: null,
            },
          }
        }

        return {
          ...curr,
          [activeProjectId]: {
            ...s,
            secondsRemaining: s.secondsRemaining - 1,
            totalSecondsToday: s.totalSecondsToday,
          },
        }
      })
    }, 1000)
  }

  function handleTimerReset() {
    setTimerStates(prev => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        secondsRemaining: 1500,
        isPaused: false,
        startedAt: null,
      },
    }))
  }

  const handleProjectAdd = async (name: string, color: string) => {
    setAddingProject(true)
    try {
      const newProject = await addProject(name, color)
      setTimerStates(prev => ({
        ...prev,
        [newProject.id]: makeTimerState(newProject.id),
      }))
      setShowAddPanel(false)
    } finally {
      setAddingProject(false)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-sm text-muted">Loading projects...</div>
  )
  if (error) return (
    <div className="flex-1 flex items-center justify-center text-sm text-red-400">{error}</div>
  )

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
            onTimerReset={handleTimerReset}
            showAddPanel={showAddPanel}
            onShowAddPanel={() => setShowAddPanel(true)}
            onHideAddPanel={() => setShowAddPanel(false)}
            onProjectAdd={handleProjectAdd}
            loading={addingProject}
          />
        )}
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'stats' && <StatsPage projects={projects} />}
      </div>

      {notification && (
        <NotificationBanner
          projectName={notification.projectName}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}
    </div>
  )
}
