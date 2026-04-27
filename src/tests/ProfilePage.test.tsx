import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfilePage from '../components/ProfilePage'

vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}))

import { useProfile } from '@/hooks/useProfile'

const mockProfile = {
  id: '1',
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const saveProfile = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useProfile).mockReturnValue({ profile: mockProfile, loading: false, error: null, saveProfile })
})

describe('ProfilePage', () => {
  it('renders all 3 fields with correct default values', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue(25)
    expect(inputs[1]).toHaveValue(5)
    expect(inputs[2]).toHaveValue(15)
  })

  it('changing work duration input updates the displayed value', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '30' } })
    expect(inputs[0]).toHaveValue(30)
  })

  it('changing short break input updates the displayed value', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[1], { target: { value: '10' } })
    expect(inputs[1]).toHaveValue(10)
  })

  it('changing long break input updates the displayed value', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[2], { target: { value: '20' } })
    expect(inputs[2]).toHaveValue(20)
  })

  it('Save button is disabled when values match profile', () => {
    render(<ProfilePage />)
    const btn = screen.getByRole('button', { name: /save changes/i })
    expect(btn).toBeDisabled()
  })

  it('Save button is enabled when a value differs from profile', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '30' } })
    const btn = screen.getByRole('button', { name: /save changes/i })
    expect(btn).toBeEnabled()
  })

  it('Save button calls saveProfile with updated values', () => {
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))
    expect(saveProfile).toHaveBeenCalledWith({ workDuration: 30, shortBreakDuration: 5, longBreakDuration: 15 })
  })

  it('inputs are disabled while loading', () => {
    vi.mocked(useProfile).mockReturnValue({ profile: null, loading: true, error: null, saveProfile })
    render(<ProfilePage />)
    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => expect(input).toBeDisabled())
  })
})
