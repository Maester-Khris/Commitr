import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HistogramSection from '../components/stats/HistogramSection'
import type { Project, AggregatedBar, SummaryStats } from '../types'

const mockProjects: Project[] = [
  { id: 'p1', name: 'Commitr', color: '#378ADD', createdAt: '2026-01-01' },
  { id: 'p2', name: 'Side Project', color: '#22c55e', createdAt: '2026-01-01' },
]

const mockBars: AggregatedBar[] = [
  { period: '2026-04-01', label: '1', totalSeconds: 3600 },
  { period: '2026-04-02', label: '2', totalSeconds: 1800 },
  { period: '2026-04-03', label: '3', totalSeconds: 0 },
]

const mockSummary: SummaryStats = {
  totalSeconds: 5400,
  dailyAverageSeconds: 1800,
  sessionCount: 3,
  topProjectId: 'p1',
  topProjectName: 'Commitr',
}

const defaultProps = {
  bars: mockBars,
  summary: mockSummary,
  projects: mockProjects,
  activeScope: 'all',
  granularity: 'month' as const,
  windowStart: '2026-04-01T00:00:00.000Z',
  loading: false,
  onScopeChange: vi.fn(),
  onGranularityChange: vi.fn(),
  onNavigate: vi.fn(),
}

describe('HistogramSection', () => {
  it('renders all 4 granularity tabs', () => {
    render(<HistogramSection {...defaultProps} />)
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
  })

  it('renders scope pill for each project', () => {
    render(<HistogramSection {...defaultProps} />)
    expect(screen.getByRole('button', { name: /commitr/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /side project/i })).toBeInTheDocument()
  })

  it('renders bars matching the bars prop', () => {
    const { getAllByTestId } = render(<HistogramSection {...defaultProps} />)
    expect(getAllByTestId('histogram-bar')).toHaveLength(mockBars.length)
  })

  it('renders all 4 summary card labels', () => {
    render(<HistogramSection {...defaultProps} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Daily average')).toBeInTheDocument()
    expect(screen.getByText('Sessions logged')).toBeInTheDocument()
    expect(screen.getByText('Top project')).toBeInTheDocument()
  })

  it('shows summary values from summary prop', () => {
    render(<HistogramSection {...defaultProps} />)
    expect(screen.getByText('1h 30m')).toBeInTheDocument() // totalSeconds 5400
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1) // sessionCount (may also appear as bar label)
    expect(screen.getAllByText('Commitr').length).toBeGreaterThanOrEqual(1) // topProjectName
  })

  it('clicking a scope pill calls onScopeChange', () => {
    const onScopeChange = vi.fn()
    render(<HistogramSection {...defaultProps} onScopeChange={onScopeChange} />)
    fireEvent.click(screen.getByRole('button', { name: /commitr/i }))
    expect(onScopeChange).toHaveBeenCalledWith('p1')
  })

  it('clicking a granularity tab calls onGranularityChange', () => {
    const onGranularityChange = vi.fn()
    render(<HistogramSection {...defaultProps} onGranularityChange={onGranularityChange} />)
    fireEvent.click(screen.getByText('Week'))
    expect(onGranularityChange).toHaveBeenCalledWith('week')
  })

  it('renders skeleton bars when loading is true', () => {
    const { getAllByTestId } = render(<HistogramSection {...defaultProps} loading={true} bars={[]} />)
    expect(getAllByTestId('histogram-bar').length).toBeGreaterThan(0)
  })

  it('shows dashes for summary values when summary is null', () => {
    render(<HistogramSection {...defaultProps} summary={null} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(3)
  })
})
