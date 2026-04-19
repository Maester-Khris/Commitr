import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResetTimerPrompt from '@/components/ResetTimer'

describe('ResetTimerPrompt', () => {
  it('displays formatted time remaining and project name', () => {
    render(
      <ResetTimerPrompt
        secondsRemaining={1334}
        projectName="Deep Work"
        onResume={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText(/Deep Work/)).toBeInTheDocument()
    expect(screen.getByText(/22:14/)).toBeInTheDocument()
  })

  it('calls onResume when Resume is clicked', () => {
    const onResume = vi.fn()
    render(
      <ResetTimerPrompt secondsRemaining={900} projectName="Alpha" onResume={onResume} onReset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(onResume).toHaveBeenCalledTimes(1)
  })

  it('calls onReset when Reset is clicked', () => {
    const onReset = vi.fn()
    render(
      <ResetTimerPrompt secondsRemaining={900} projectName="Alpha" onResume={vi.fn()} onReset={onReset} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
