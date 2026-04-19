import { useState } from 'react'
import type { Project } from '../types'

interface ProjectSelectorProps {
  projects: Project[]
  activeProjectId: string
  onSelect: (id: string) => void
  onAdd: () => void
  showingAddPanel?: boolean
}

export default function ProjectSelector({
  projects,
  activeProjectId,
  onSelect,
  onAdd,
  showingAddPanel,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeProject = projects.find(p => p.id === activeProjectId)

  function handleSelect(id: string) {
    onSelect(id)
    setIsOpen(false)
  }

  return (
    <div className="relative flex items-center gap-2 md:gap-3" style={{ width: '260px' }}>
      <div className="relative w-full">
        {isOpen && (
          <div
            className="absolute bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-10"
            style={{ top: 'calc(100% + 8px)', left: 0, right: 0 }}
          >
            <ul className="overflow-y-auto scrollbar-none" style={{ maxHeight: '160px', scrollbarWidth: 'none' }}>
              {projects.map(project => (
                <li key={project.id}>
                  <button
                    onClick={() => handleSelect(project.id)}
                    className={`w-full text-left px-4 text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors min-h-[44px] ${project.id === activeProjectId ? 'text-white' : 'text-gray-400'}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: project.color }}
                    />
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-700">
              <button
                onClick={() => { onAdd(); setIsOpen(false) }}
                className="w-full text-left px-4 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors min-h-[44px] flex items-center"
              >
                + New project
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-4 bg-gray-900 border border-gray-700 rounded-full text-sm hover:bg-gray-800 transition-colors min-h-[44px]"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: activeProject?.color }}
          />
          <div className="overflow-hidden flex-1 text-left">
            <span
              key={activeProjectId}
              className="inline-block"
              style={{ animation: 'slide-in-up 0.2s ease-in-out' }}
            >
              {activeProject?.name}
            </span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500 ml-auto flex-shrink-0">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      <button
        onClick={onAdd}
        className={`flex-shrink-0 flex items-center justify-center rounded-full border transition-colors ${
          showingAddPanel
            ? 'bg-blue-600 border-blue-500 text-white'
            : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
        style={{ width: '44px', height: '44px', fontSize: '20px' }}
        title="Add project"
      >
        +
      </button>
    </div>
  )
}
