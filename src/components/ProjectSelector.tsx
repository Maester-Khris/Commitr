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
    <div className="relative flex items-center gap-3 w-full">
      <div className="relative flex-1">
        {isOpen && (
          <div
            className="absolute bg-[#16191D] border border-[#26292F] rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: 'calc(100% + 12px)', left: 0, right: 0 }}
          >
            <ul className="overflow-y-auto scrollbar-none py-2" style={{ maxHeight: '200px' }}>
              {projects.map(project => (
                <li key={project.id}>
                  <button
                    onClick={() => handleSelect(project.id)}
                    className={`w-full text-left px-5 text-sm flex items-center gap-3 hover:bg-[#1E2329] transition-colors min-h-[48px] ${project.id === activeProjectId ? 'text-white font-bold' : 'text-slate-400'}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ background: project.color }}
                    />
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#26292F] bg-[#1E232950]">
              <button
                onClick={() => { onAdd(); setIsOpen(false) }}
                className="w-full text-left px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors min-h-[48px] flex items-center"
              >
                + New project
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-5 bg-[#16191D] border border-[#26292F] rounded-full text-sm font-medium text-slate-200 hover:border-slate-500 transition-all min-h-[48px] shadow-sm active:scale-[0.98]"
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: activeProject?.color }}
          />
          <div className="overflow-hidden flex-1 text-left">
            <span
              key={activeProjectId}
              className="inline-block truncate"
              style={{ animation: 'slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {activeProject?.name}
            </span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={`text-slate-500 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      <button
        onClick={onAdd}
        className={`flex-shrink-0 flex items-center justify-center rounded-full border transition-all duration-300 shadow-sm active:scale-[0.9] ${showingAddPanel
            ? 'bg-[#378ADD] border-[#378ADD] text-white shadow-lg shadow-[#378ADD20]'
            : 'bg-[#16191D] border-[#26292F] text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        style={{ width: '48px', height: '48px', fontSize: '24px' }}
        title="Add project"
      >
        <span className={showingAddPanel ? 'rotate-45 transition-transform duration-300' : 'transition-transform duration-300'}>+</span>
      </button>
    </div>
  )
}
