import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfilePage from '../components/ProfilePage'

vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/authService', () => ({
  authService: {
    updateUser: vi.fn(),
  },
}))

import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'

const mockProfile = {
  id: '1',
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockUser = {
  id: 'test-user-id',
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  email: 'test@example.com',
  user_metadata: {
    display_name: 'testuser'
  }
}

const saveProfile = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useProfile).mockReturnValue({ profile: mockProfile, loading: false, error: null, saveProfile })
  vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false, session: null, signIn: vi.fn(), signUp: vi.fn(), signInWithGoogle: vi.fn(), signOut: vi.fn() })
  vi.mocked(authService.updateUser).mockResolvedValue({ user: mockUser, error: null })
})

describe('ProfilePage', () => {
  it('renders both sections', () => {
    render(<ProfilePage />)
    expect(screen.getByText('Personal info')).toBeInTheDocument()
    expect(screen.getByText('Timer defaults')).toBeInTheDocument()
  })

  it('renders username prefilled from metadata', () => {
    render(<ProfilePage />)
    const usernameInput = screen.getByDisplayValue('testuser')
    expect(usernameInput).toBeInTheDocument()
  })

  it('renders timer fields with default values', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue(25)
    expect(inputs[1]).toHaveValue(5)
    expect(inputs[2]).toHaveValue(15)
  })

  it('Save personal info calls updateUser', async () => {
    render(<ProfilePage />)
    const usernameInput = screen.getByLabelText(/username/i)
    fireEvent.change(usernameInput, { target: { value: 'newusername' } })
    
    const saveBtn = screen.getByRole('button', { name: /save personal info/i })
    fireEvent.click(saveBtn)
    
    expect(authService.updateUser).toHaveBeenCalledWith({ data: { display_name: 'newusername' } })
  })

  it('Save timer defaults calls saveProfile', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '30' } })
    
    const saveBtn = screen.getByRole('button', { name: /save timer defaults/i })
    fireEvent.click(saveBtn)
    
    expect(saveProfile).toHaveBeenCalledWith({ workDuration: 30, shortBreakDuration: 5, longBreakDuration: 15 })
  })

  it('New password field shows confirm password field when not empty', () => {
    render(<ProfilePage />)
    expect(screen.queryByLabelText(/confirm new password/i)).not.toBeInTheDocument()
    
    const passInput = screen.getByLabelText(/new password/i)
    fireEvent.change(passInput, { target: { value: 'password123' } })
    
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })
})
