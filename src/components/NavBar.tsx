import { useState, useRef, useEffect } from 'react'
import logo from '../assets/images/logo.png'
import brand from '../assets/images/brand.png'
import { useAuth } from '@/context/AuthContext'
import type { NavPage } from '../types'

interface NavBarProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
  userEmail?: string
  onSignOut?: () => void
}

// Icons
const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
    <path d="M4 6l4 4 4-4" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="6" r="3" />
    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
  </svg>
)

const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H7" />
  </svg>
)

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 7l6-5 6 5v7H10v-4H6v4H2z" />
  </svg>
)

const StatsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12l4-4 3 3 5-7" />
  </svg>
)

// Sub-components
const BrandMark = () => (
  <div className="flex items-center flex-shrink-0">
    {/* Desktop: brand image only */}
    <img
      src={brand}
      alt="Commitr"
      className="hidden md:block h-12 w-auto object-contain"
    />

    {/* Mobile: logo image + text */}
    <div className="flex md:hidden items-center gap-2">
      <img src={logo} alt="Commitr Logo" className="h-8 w-auto object-contain" />
      <span className="text-xl font-bold tracking-tight text-white">Commitr</span>
    </div>
  </div>
)

interface AvatarProps {
  initial: string
  size?: 'sm' | 'md'
}

const Avatar = ({ initial, size = 'md' }: AvatarProps) => (
  <div className={`rounded-full bg-[#185FA5] border border-[#378ADD] flex items-center justify-center font-medium text-[#B5D4F4] flex-shrink-0 ${size === 'sm' ? 'w-[26px] h-[26px] text-[11px]' : 'w-[28px] h-[28px] text-[12px]'}`}>
    {initial}
  </div>
)

const HamburgerButton = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-[4px] w-8 h-8 rounded hover:bg-white/5 transition-colors"
    aria-label="Toggle menu"
  >
    <span className={`block w-4 h-0.5 bg-gray-400 transition-transform duration-200 ${isOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
    <span className={`block w-4 h-0.5 bg-gray-400 transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
    <span className={`block w-4 h-0.5 bg-gray-400 transition-transform duration-200 ${isOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
  </button>
)

export default function NavBar({ activePage, onNavigate, userEmail, onSignOut }: NavBarProps) {
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    userEmail?.split('@')[0] ||
    'User'

  const avatarInitial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleNav = (page: NavPage) => {
    onNavigate(page)
    setDropdownOpen(false)
    setDrawerOpen(false)
  }

  const handleSignOutClick = () => {
    onSignOut?.()
    setDropdownOpen(false)
    setDrawerOpen(false)
  }

  return (
    <div className="relative z-50">
      {/* Desktop NavBar */}
      <nav className="hidden md:flex items-center justify-between px-10 h-[80px] py-4 border-b border-white/10 bg-[#111318]">
        <BrandMark />

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => handleNav('home')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activePage === 'home' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('stats')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activePage === 'stats' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Stats
          </button>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-colors"
          >
            <Avatar initial={avatarInitial} />
            <span className="text-sm font-medium text-white">{displayName}</span>
            <ChevronDownIcon />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-[#111318] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
              <div className="px-3 py-2.5 border-b border-white/5">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{userEmail}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  <ProfileIcon />
                  Profile
                </button>
              </div>
              <div className="border-t border-white/5 p-1">
                <button
                  onClick={handleSignOutClick}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                >
                  <SignOutIcon />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile NavBar */}
      <nav className="md:hidden flex items-center justify-between px-4 h-[64px] py-2 border-b border-white/10 bg-[#111318]">
        <BrandMark />
        <div className="flex items-center gap-2">
          <Avatar initial={avatarInitial} size="sm" />
          <HamburgerButton onClick={() => setDrawerOpen(!drawerOpen)} isOpen={drawerOpen} />
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden border-b border-white/10 bg-[#111318] animate-in slide-in-from-top duration-200 shadow-2xl">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{userEmail}</p>
          </div>
          <div className="p-2 flex flex-col gap-0.5">
            <button
              onClick={() => handleNav('home')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activePage === 'home' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <HomeIcon /> Home
            </button>
            <button
              onClick={() => handleNav('profile')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activePage === 'profile' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <ProfileIcon /> Profile
            </button>
            <button
              onClick={() => handleNav('stats')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activePage === 'stats' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <StatsIcon /> Stats
            </button>
          </div>
          <div className="border-t border-white/5 p-2">
            <button
              onClick={handleSignOutClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 transition-colors hover:bg-red-400/5"
            >
              <SignOutIcon /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
