import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SessionStatus from '../components/SessionStatus'

describe('SessionStatus', () => {
  it('shows idle message when not running', () => {
    render(<SessionStatus isRunning={false} projectName="Commitr" totalSecondsToday={0} />)
    expect(screen.getByText('Click to start session')).toBeInTheDocument()
  })

  it('shows running state with project name', () => {
    render(<SessionStatus isRunning={true} projectName="Commitr" totalSecondsToday={0} />)
    expect(screen.getByText(/Commitr · running/)).toBeInTheDocument()
  })

  it('shows today total in minutes when time > 0 while running', () => {
    render(<SessionStatus isRunning={true} projectName="Commitr" totalSecondsToday={300} />)
    expect(screen.getByText(/today: 5m/)).toBeInTheDocument()
  })

  it('shows today total when idle with logged time', () => {
    render(<SessionStatus isRunning={false} projectName="Commitr" totalSecondsToday={120} />)
    expect(screen.getByText(/today: 2m/)).toBeInTheDocument()
  })
})
