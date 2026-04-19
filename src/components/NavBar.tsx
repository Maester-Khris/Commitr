import { useState } from 'react'
import type { NavPage } from '../types'

interface NavBarProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
}

const PAGES: { id: NavPage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'stats', label: 'Stats' },
]

export default function NavBar({ activePage, onNavigate }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeLabel = PAGES.find(p => p.id === activePage)?.label ?? ''

  function handleNavigate(page: NavPage) {
    onNavigate(page)
    setMobileOpen(false)
  }

  return (
    <div className="relative border-b border-gray-800">
      <nav className="flex items-center px-4 md:px-14 py-4">
        {/* Brand */}
        <span className="text-lg font-semibold tracking-tight min-w-0 truncate">
          Commitr
        </span>

        {/* Mobile: active page label + hamburger */}
        <div className="flex items-center gap-3 ml-auto md:hidden">
          <span className="text-sm text-gray-400">{activeLabel}</span>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="flex flex-col items-center justify-center gap-[5px] w-[44px] h-[44px] rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-300 transition-transform duration-200 ${mobileOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-transform duration-200 ${mobileOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Desktop: pill group */}
        <div className="hidden md:flex gap-1 bg-gray-900 rounded-lg p-1 ml-auto flex-shrink-0">
          {PAGES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`rounded-md text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center px-[22px] ${
                activePage === id
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 z-40 shadow-xl">
          {PAGES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`w-full text-left px-6 min-h-[52px] flex items-center text-sm font-medium transition-colors border-b border-gray-800 last:border-0 ${
                activePage === id
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {activePage === id && (
                <span className="w-1.5 h-1.5 rounded-full bg-white mr-3 flex-shrink-0" />
              )}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
