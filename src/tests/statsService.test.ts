import { describe, it, expect, vi, beforeEach } from 'vitest'
import { statsService } from '@/services/statsService'

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))
vi.mock('@/lib/statsHelpers', () => ({
  formatPeriodLabel: (_period: string, _g: string) => 'Apr',
}))

import { supabase } from '@/lib/supabaseClient'

function mockFrom(returnValue: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: vi.fn(),
  }
  Object.defineProperty(chain, 'then', {
    get: () => (resolve: (v: unknown) => void) => resolve(returnValue),
  })
  vi.mocked(supabase.from).mockReturnValue(chain as never)
  return chain
}

beforeEach(() => vi.clearAllMocks())

describe('statsService.getAggregatedSessions', () => {
  it('maps view rows to AggregatedBar[]', async () => {
    mockFrom({
      data: [{ period: '2026-04-01', total_seconds: 3600, session_count: 2 }],
      error: null,
    })

    const bars = await statsService.getAggregatedSessions('month', 'all', '2026-04-01', '2026-04-30')
    expect(bars).toHaveLength(1)
    expect(bars[0]).toMatchObject({ period: '2026-04-01', totalSeconds: 3600, label: 'Apr' })
  })

  it('adds eq filter when projectId is not "all"', async () => {
    const chain = mockFrom({ data: [], error: null })
    await statsService.getAggregatedSessions('month', 'p1', '2026-04-01', '2026-04-30')
    expect(chain.eq).toHaveBeenCalledWith('project_id', 'p1')
  })

  it('does not add eq filter when projectId is "all"', async () => {
    const chain = mockFrom({ data: [], error: null })
    await statsService.getAggregatedSessions('month', 'all', '2026-04-01', '2026-04-30')
    expect(chain.eq).not.toHaveBeenCalled()
  })

  it('throws on Supabase error', async () => {
    mockFrom({ data: null, error: { message: 'view error' } })
    await expect(
      statsService.getAggregatedSessions('month', 'all', '2026-04-01', '2026-04-30')
    ).rejects.toThrow('view error')
  })
})

describe('statsService.getSummaryStats', () => {
  it('maps RPC response to SummaryStats', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        total_seconds: 7200,
        daily_average_seconds: 3600,
        session_count: 4,
        top_project_id: 'p1',
        top_project_name: 'Alpha',
      },
      error: null,
    } as never)

    const summary = await statsService.getSummaryStats('all', '2026-04-01', '2026-04-30')
    expect(summary).toEqual({
      totalSeconds: 7200,
      dailyAverageSeconds: 3600,
      sessionCount: 4,
      topProjectId: 'p1',
      topProjectName: 'Alpha',
    })
  })

  it('throws on Supabase error', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'rpc error' } } as never)
    await expect(
      statsService.getSummaryStats('all', '2026-04-01', '2026-04-30')
    ).rejects.toThrow('rpc error')
  })
})

describe('statsService.getContributionGrid', () => {
  it('maps RPC response to ContributionDay[]', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ day: '2026-04-10', level: 2, total_seconds: 1800 }],
      error: null,
    } as never)

    const grid = await statsService.getContributionGrid('all', '2026-01-01', '2026-04-30')
    expect(grid).toHaveLength(1)
    expect(grid[0]).toEqual({ day: '2026-04-10', level: 2, totalSeconds: 1800 })
  })

  it('passes null project_id when scope is "all"', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as never)
    await statsService.getContributionGrid('all', '2026-01-01', '2026-04-30')
    expect(supabase.rpc).toHaveBeenCalledWith('get_contribution_grid', expect.objectContaining({ p_project_id: null }))
  })

  it('throws on Supabase error', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'grid error' } } as never)
    await expect(
      statsService.getContributionGrid('all', '2026-01-01', '2026-04-30')
    ).rejects.toThrow('grid error')
  })
})
