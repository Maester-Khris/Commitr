import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectService } from '@/services/projectService'

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '@/lib/supabaseClient'

const mockRow = { id: 'abc', name: 'Test', color: '#fff', created_at: '2024-01-01T00:00:00Z' }
const expectedProject = { id: 'abc', name: 'Test', color: '#fff', createdAt: '2024-01-01T00:00:00Z' }

function makeChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
  }
  Object.assign(chain, overrides)
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.single = vi.fn(() => chain)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('projectService.getProjects', () => {
  it('returns mapped Project[] on success', async () => {
    const chain = makeChain()
    chain.order = vi.fn().mockResolvedValue({ data: [mockRow], error: null })
    vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>)

    const result = await projectService.getProjects()
    expect(result).toEqual([expectedProject])
  })

  it('throws on Supabase error', async () => {
    const chain = makeChain()
    chain.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>)

    await expect(projectService.getProjects()).rejects.toThrow('DB error')
  })
})

describe('projectService.createProject', () => {
  it('returns a mapped Project on success', async () => {
    const chain = makeChain()
    chain.single = vi.fn().mockResolvedValue({ data: mockRow, error: null })
    vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>)

    const result = await projectService.createProject('Test', '#fff')
    expect(result).toEqual(expectedProject)
  })

  it('throws on Supabase error', async () => {
    const chain = makeChain()
    chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>)

    await expect(projectService.createProject('Test', '#fff')).rejects.toThrow('Insert failed')
  })
})
