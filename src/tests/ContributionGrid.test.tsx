import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContributionGrid from '../components/stats/ContributionGrid'
import type { ContributionDay } from '../types'

const mockGrid: ContributionDay[] = [
  { day: '2026-01-15', level: 2, totalSeconds: 1800 },
  { day: '2026-02-20', level: 3, totalSeconds: 3600 },
]

describe('ContributionGrid', () => {
  it('renders 52 × 7 = 364 cells', () => {
    const { getAllByTestId } = render(<ContributionGrid grid={mockGrid} />)
    expect(getAllByTestId('grid-cell').length).toBeGreaterThanOrEqual(364)
  })

  it('renders 5 legend color stops', () => {
    const { getByTestId } = render(<ContributionGrid grid={[]} />)
    expect(getByTestId('legend-stops').children).toHaveLength(5)
  })

  it('renders month labels', () => {
    render(<ContributionGrid grid={[]} />)
    // At least a few months should always be visible in the 52-week window
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const visibleMonths = months.filter(m => screen.queryAllByText(m).length > 0)
    expect(visibleMonths.length).toBeGreaterThanOrEqual(6)
  })

  it('applies level color to cells from grid data', () => {
    const { getAllByTestId } = render(<ContributionGrid grid={mockGrid} />)
    const cells = getAllByTestId('grid-cell')
    // Level-2 cell should have the #378ADD background color
    const highlightedCell = cells.find(c => (c as HTMLElement).style.background === 'rgb(55, 138, 221)')
    expect(highlightedCell).toBeTruthy()
  })
})
