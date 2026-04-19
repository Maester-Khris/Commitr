import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NotificationBanner from '@/components/NotificationBanner'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('NotificationBanner', () => {
  it('renders project name and message', () => {
    render(<NotificationBanner projectName="Commitr" message="Session complete" onDismiss={vi.fn()} />)
    expect(screen.getByText('Commitr')).toBeInTheDocument()
    expect(screen.getByText(/Session complete/)).toBeInTheDocument()
  })

  it('calls onDismiss when ✕ is clicked', () => {
    const onDismiss = vi.fn()
    render(<NotificationBanner projectName="Commitr" message="Session complete" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss automatically after 6 seconds', () => {
    const onDismiss = vi.fn()
    render(<NotificationBanner projectName="Commitr" message="Session complete" onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(6000)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
