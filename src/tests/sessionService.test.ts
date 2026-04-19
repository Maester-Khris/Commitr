import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sessionService } from '@/services/sessionService'

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '@/lib/supabaseClient'

const mockRow = {
  id: 'sess-1',
  project_id: 'proj-1',
  started_at: '2024-01-01T10:00:00Z',
  ended_at: '2024-01-01T10:25:00Z',
  duration_seconds: 1500,
}
const expectedSession = {
  id: 'sess-1',
  projectId: 'proj-1',
  startedAt: '2024-01-01T10:00:00Z',
  endedAt: '2024-01-01T10:25:00Z',
  durationSeconds: 1500,
}

function makeChain() {
  const chain: Record<string, unknown> = {}
  chain.insert = vi.fn(() => chain)
  chain.select = vi.fn(() => chain)
  chain.single = vi.fn(() => chain)
  return chain
}

beforeEach(() => vi.clearAllMocks())

describe('sessionService.createSession', () => {
  it('returns a mapped Session on success', async () => {
    const chain = makeChain()
    chain.single = vi.fn().mockResolvedValue({ data: mockRow, error: null })
    vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>)

    const result = await sessionService.createSession('proj-1', '2024-01-01T10:00:00Z', '2024-01-01T10:25:00Z', 1500)
    expect(result).toEqual(expectedSession)
  })

  it('throws on Supabase error', async () => {
    const chain = makeChain()
    chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert error' } })
    vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>)

    await expect(
      sessionService.createSession('proj-1', '2024-01-01T10:00:00Z', '2024-01-01T10:25:00Z', 1500)
    ).rejects.toThrow('Insert error')
  })
})
