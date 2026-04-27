import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NavBar from '../components/NavBar'

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/context/AuthContext'

const mockUser = {
  email: 'test@example.com',
  user_metadata: {
    display_name: 'testuser'
  }
}

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false, session: null, signIn: vi.fn(), signUp: vi.fn(), signInWithGoogle: vi.fn(), signOut: vi.fn() } as any)
  })

  it('renders brand name', () => {
    render(<NavBar activePage="home" onNavigate={() => {}} userEmail="test@example.com" />)
    // One for desktop, one for mobile
    const brandElements = screen.getAllByText('Commitr')
    expect(brandElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Home and Stats nav items on desktop, but not Profile', () => {
    render(<NavBar activePage="home" onNavigate={() => {}} userEmail="test@example.com" />)
    // On desktop, we have buttons for Home and Stats
    expect(screen.getByRole('button', { name: /^home$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^stats$/i })).toBeInTheDocument()
    // Profile should not be visible initially
    expect(screen.queryByRole('button', { name: /^profile$/i })).not.toBeInTheDocument()
  })

  it('desktop identity pill shows display name', () => {
    render(<NavBar activePage="home" onNavigate={() => {}} userEmail="test@example.com" />)
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('clicking identity pill opens dropdown with Profile and Sign out', () => {
    render(<NavBar activePage="home" onNavigate={() => {}} userEmail="test@example.com" />)
    const pill = screen.getByText('testuser')
    fireEvent.click(pill)
    
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('mobile hamburger toggles drawer', () => {
    render(<NavBar activePage="home" onNavigate={() => {}} userEmail="test@example.com" />)
    const hamburger = screen.getByLabelText(/toggle menu/i)
    
    // Profile should not be in the document at all (neither dropdown nor drawer open)
    expect(screen.queryByText(/profile/i)).not.toBeInTheDocument()
    
    fireEvent.click(hamburger)
    // Drawer should open and show nav items
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getAllByText(/home/i).length).toBeGreaterThan(1)
  })

  it('sign out calls onSignOut', () => {
    const onSignOut = vi.fn()
    render(<NavBar activePage="home" onNavigate={() => {}} userEmail="test@example.com" onSignOut={onSignOut} />)
    
    // Open desktop dropdown
    fireEvent.click(screen.getByText('testuser'))
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    
    expect(onSignOut).toHaveBeenCalled()
  })
})
