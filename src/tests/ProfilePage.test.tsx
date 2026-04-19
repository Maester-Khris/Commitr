import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfilePage from '../components/ProfilePage'

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

  it('Save changes button is present and disabled', () => {
    render(<ProfilePage />)
    const btn = screen.getByRole('button', { name: /save changes/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })
})
