import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProjects } from '@/hooks/useProjects'

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
  },
}))

import { projectService } from '@/services/projectService'

const project1 = { id: '1', name: 'Alpha', color: '#aaa', createdAt: '2024-01-01T00:00:00Z' }
const project2 = { id: '2', name: 'Beta', color: '#bbb', createdAt: '2024-01-02T00:00:00Z' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProjects', () => {
  it('populates projects after mount', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue([project1])

    const { result } = renderHook(() => useProjects())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.projects).toEqual([project1])
    expect(result.current.error).toBeNull()
  })

  it('loading is true during fetch, false after', async () => {
    let resolve!: (v: typeof project1[]) => void
    vi.mocked(projectService.getProjects).mockReturnValue(new Promise(r => { resolve = r }))

    const { result } = renderHook(() => useProjects())
    expect(result.current.loading).toBe(true)

    await act(async () => resolve([project1]))
    expect(result.current.loading).toBe(false)
  })

  it('sets error when service throws', async () => {
    vi.mocked(projectService.getProjects).mockRejectedValue(new Error('fetch failed'))

    const { result } = renderHook(() => useProjects())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('fetch failed')
    expect(result.current.projects).toEqual([])
  })

  it('addProject appends to projects without refetching', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue([project1])
    vi.mocked(projectService.createProject).mockResolvedValue(project2)

    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addProject('Beta', '#bbb')
    })

    expect(result.current.projects).toEqual([project1, project2])
    expect(projectService.getProjects).toHaveBeenCalledTimes(1)
  })
})
