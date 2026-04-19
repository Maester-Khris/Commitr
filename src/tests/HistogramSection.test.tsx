import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HistogramSection from '../components/stats/HistogramSection'
import type { Project, Session } from '../types'

const mockProjects: Project[] = [
  { id: 'p1', name: 'Commitr', color: '#378ADD', createdAt: '2026-01-01' },
  { id: 'p2', name: 'Side Project', color: '#22c55e', createdAt: '2026-01-01' },
]

const mockSessions: Session[] = [
  { id: 's1', projectId: 'p1', startedAt: new Date().toISOString(), endedAt: null, durationSeconds: 3600 },
  { id: 's2', projectId: 'p2', startedAt: new Date().toISOString(), endedAt: null, durationSeconds: 1800 },
]

describe('HistogramSection', () => {
  it('renders all 4 granularity tabs', () => {
    render(<HistogramSection sessions={mockSessions} projects={mockProjects} />)
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
  })

  it('clicking a scope pill marks it active', () => {
    render(<HistogramSection sessions={mockSessions} projects={mockProjects} />)
    const commitrButton = screen.getByRole('button', { name: /commitr/i })
    fireEvent.click(commitrButton)
    expect(commitrButton).toHaveClass('font-medium')
  })

  it('renders correct number of bars for month granularity', () => {
    const { getAllByTestId } = render(<HistogramSection sessions={mockSessions} projects={mockProjects} />)
    // Month granularity is default — days in current month (28-31 bars)
    const bars = getAllByTestId('histogram-bar')
    expect(bars.length).toBeGreaterThanOrEqual(28)
  })

  it('renders all 4 summary card labels', () => {
    render(<HistogramSection sessions={mockSessions} projects={mockProjects} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Daily average')).toBeInTheDocument()
    expect(screen.getByText('Sessions logged')).toBeInTheDocument()
    expect(screen.getByText('Top project')).toBeInTheDocument()
  })
})
