import { useState, useEffect, useRef } from 'react'

export const PROJECT_COLORS = [
  '#378ADD', '#1D9E75', '#D85A30', '#9F77DD',
  '#E24B4A', '#BA7517', '#D4537E', '#888780',
]

interface AddProjectPanelProps {
  onSave: (name: string, color: string) => void
  onCancel: () => void
  loading?: boolean
}

export default function AddProjectPanel({ onSave, onCancel, loading }: AddProjectPanelProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  function handleSave() {
    if (!name.trim() || loading) return
    onSave(name.trim(), color)
  }

  return (
    <div className="w-full bg-[#0F1115] md:border md:border-[#26292F] rounded-2xl p-5 md:p-8 flex flex-col gap-6 md:gap-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
      {/* Input Group */}
      <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-2">
        <label className="text-[13px] text-gray-400 font-medium w-20 md:w-auto flex-shrink-0">Project name</label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Deep Work"
          className="flex-1 md:w-full bg-[#0F1115] border border-[#26292F] rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm text-white outline-none focus:border-[#378ADD] transition-colors"
        />
      </div>

      {/* Color Group */}
      <div className="flex flex-row md:flex-col items-start gap-3">
        <label className="text-[13px] text-gray-400 font-medium w-20 md:w-auto flex-shrink-0 pt-1">Color label</label>
        <div className="flex flex-row flex-wrap md:flex-nowrap justify-end md:justify-start gap-2 md:gap-2.5 flex-1 md:flex-none md:overflow-x-auto md:pb-2 scrollbar-none">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-full flex-shrink-0 transition-all ${color === c
                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#16181D]'
                : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              style={{ backgroundColor: c }}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-1 md:mt-2">
        <button
          onClick={onCancel}
          className="px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#26292F] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || loading}
          className="px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-xs font-semibold bg-[#378ADD] text-white hover:bg-[#4a96e3] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#378ADD]/20"
        >
          {loading ? '...' : (
            <span className="md:hidden">Save</span>
          )}
          <span className="hidden md:inline">{loading ? '...' : 'Create Project'}</span>
        </button>
      </div>
    </div>
  )
}
