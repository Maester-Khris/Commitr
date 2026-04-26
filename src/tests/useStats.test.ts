import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStats } from '@/hooks/useStats'

vi.mock('@/services/statsService', () => ({
  statsService: {
    getAggregatedSessions: vi.fn(),
    getSummaryStats: vi.fn(),
    getContributionGrid: vi.fn(),
  },
}))

import { statsService } from '@/services/statsService'

const mockBars = [{ period: '2026-04-01', label: 'Apr', totalSeconds: 3600 }]
const mockSummary = { totalSeconds: 3600, dailyAverageSeconds: 1800, sessionCount: 2, topProjectId: 'p1', topProjectName: 'Alpha' }
const mockGrid = [{ day: '2026-04-10', level: 2, totalSeconds: 1800 }]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(statsService.getAggregatedSessions).mockResolvedValue(mockBars)
  vi.mocked(statsService.getSummaryStats).mockResolvedValue(mockSummary)
  vi.mocked(statsService.getContributionGrid).mockResolvedValue(mockGrid)
})

describe('useStats', () => {
  it('starts with loading true', () => {
    const { result } = renderHook(() => useStats('month', 'all', '2026-04-01', '2026-04-30'))
    expect(result.current.loading).toBe(true)
  })

  it('populates bars, summary, grid on success', async () => {
    const { result } = renderHook(() => useStats('month', 'all', '2026-04-01', '2026-04-30'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.bars).toEqual(mockBars)
    expect(result.current.summary).toEqual(mockSummary)
    expect(result.current.grid).toEqual(mockGrid)
    expect(result.current.error).toBeNull()
  })

  it('sets error string on failure', async () => {
    vi.mocked(statsService.getAggregatedSessions).mockRejectedValue(new Error('fetch failed'))

    const { result } = renderHook(() => useStats('month', 'all', '2026-04-01', '2026-04-30'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('fetch failed')
    expect(result.current.bars).toEqual([])
  })

  it('cancels stale fetch when params change', async () => {
    let resolveFirst!: (v: typeof mockBars) => void
    vi.mocked(statsService.getAggregatedSessions).mockReturnValueOnce(
      new Promise(r => { resolveFirst = r })
    )

    const { result, rerender } = renderHook(
      ({ start }) => useStats('month', 'all', start, '2026-04-30'),
      { initialProps: { start: '2026-04-01' } }
    )

    // Trigger re-render with new param before first resolves
    rerender({ start: '2026-03-01' })

    await waitFor(() => expect(result.current.loading).toBe(false))

    // Resolve the stale first fetch — should be ignored
    resolveFirst([{ period: '2026-04-01', label: 'Apr', totalSeconds: 9999 }])

    // State should reflect the second fetch's result, not the stale one
    expect(result.current.bars).toEqual(mockBars)
  })
})
