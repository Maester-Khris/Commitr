import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContributionGrid from '../components/stats/ContributionGrid'
import type { Session } from '../types'

const mockSessions: Session[] = [
  { id: 's1', projectId: 'p1', startedAt: '2026-01-15T10:00:00Z', endedAt: null, durationSeconds: 1800 },
  { id: 's2', projectId: 'p2', startedAt: '2026-02-20T14:00:00Z', endedAt: null, durationSeconds: 3600 },
]

describe('ContributionGrid', () => {
  it('renders 52 × 7 = 364 cells', () => {
    const { getAllByTestId } = render(<ContributionGrid sessions={mockSessions} />)
    expect(getAllByTestId('grid-cell').length).toBeGreaterThanOrEqual(364)
  })

  it('renders 5 legend color stops', () => {
    const { getByTestId } = render(<ContributionGrid sessions={mockSessions} />)
    expect(getByTestId('legend-stops').children).toHaveLength(5)
  })

  it('renders all 12 month labels', () => {
    render(<ContributionGrid sessions={mockSessions} />)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    months.forEach(m => expect(screen.getByText(m)).toBeInTheDocument())
  })
})
